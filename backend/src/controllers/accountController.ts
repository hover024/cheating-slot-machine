import { PrismaClient } from '@prisma/client';
import RollStrategyFactory from '../lib/rollStrategyFactory';
import { BadRequestError, NotFoundError } from '../lib/errors';

const prisma = new PrismaClient();

export const roll = async (sessionId: number, balance: number) => {
  if (balance <= 0) {
    throw new BadRequestError("Insufficient balance");
  }

  let newBalance = balance - 1;
  const rollStrategy = RollStrategyFactory.get(balance);
  const { rollResult, winCost } = rollStrategy.roll();

  newBalance += winCost;

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: { balance: newBalance },
  });

  return {
    rollResult,
    newBalance: updatedSession.balance,
  };
};

export const cashout = async (
  accountId: string,
  sessionId: number,
  accountBalance: number,
  sessionBalance: number
) => {
  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: { balance: accountBalance + sessionBalance },
  });

  await prisma.session.delete({
    where: { id: sessionId },
  });

  return updatedAccount;
};

export const getAccount = async (
  accountId: string,
  session?: { id: number; balance: number }
) => {
  if (!session) {
    throw new NotFoundError("No active session found");
  }

  return {
    id: accountId,
    sessionBalance: session.balance,
    accountBalance: await getAccountBalance(accountId),
  };
};

export const createSession = async (accountId: string, balance?: number) => {
  const account = await prisma.account.findUnique({ where: { id: accountId } });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  const accountBalance = account?.balance ?? 0;

  if (balance! > accountBalance) {
    throw new BadRequestError("Can't allocate this amount");
  }

  const newSession = await prisma.session.create({
    data: {
      account: { connect: { id: accountId } },
      balance: balance ?? accountBalance,
    },
  });

  await prisma.account.update({
    where: { id: accountId },
    data: { balance: accountBalance - (balance ?? accountBalance) },
  });

  return {
    accountId,
    sessionId: newSession.id,
    sessionBalance: newSession.balance,
    accountBalance: await getAccountBalance(accountId),
  };
};

export const createAccount = async (id: string, balance: number = 10) => {
  const result = await prisma.account.create({
    data: {
      id,
      balance,
    },
  });
  return result;
};

const getAccountBalance = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  return account.balance;
};
