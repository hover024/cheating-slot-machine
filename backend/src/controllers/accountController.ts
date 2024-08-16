import { PrismaClient } from '@prisma/client';
import { computeRollResult, getRandomFruit } from '../utils';

const prisma = new PrismaClient();

export const roll = async (sessionId: number, balance: number) => {
  let rollResult = new Array(3).fill(null).map(() => getRandomFruit());
  let winCost = computeRollResult(rollResult);
  let newBalance = balance - 1;

  if (winCost && balance > 40) {
    const chance = balance > 60 ? 60 : 30;
    const shouldRollAgain = Math.random() * 100 <= chance;

    if (shouldRollAgain) {
      rollResult = new Array(3).fill(null).map(() => getRandomFruit());
      winCost = computeRollResult(rollResult);
    }

    newBalance += winCost;
  }

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: { balance: newBalance },
  });

  return {
    rollResult,
    newBalance: updatedSession.balance,
  };
};

export const cashout = async (accountId: string, sessionId: number, accountBalance: number, sessionBalance: number) => {
  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: { balance: accountBalance + sessionBalance },
  });

  await prisma.session.delete({
    where: { id: sessionId },
  });

  return updatedAccount;
};

export const getAccount = async (accountId: string, session?: { id: number, balance: number }) => {
  if (!session) {
    return { error: "no session created" };
  }

  return {
    id: accountId,
    sessionBalance: session.balance,
    accountBalance: await getAccountBalance(accountId),
  };
};

export const createSession = async (accountId: string, balance?: number) => {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  const accountBalance = account?.balance ?? 0;

  if (balance! > accountBalance) {
    return { error: "can't allocate this amount" };
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
  return account?.balance ?? 0;
};
