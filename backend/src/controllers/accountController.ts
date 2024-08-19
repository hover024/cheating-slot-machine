import { Account, Session } from '@prisma/client';
import RollStrategyFactory from '../lib/rollStrategyFactory';
import { BadRequestError } from '../lib/errors';
import AccountRepository from '../repositories/accountRepository';
import SessionRepository from '../repositories/sessionRepository';

const accountRepository = new AccountRepository();
const sessionRepository = new SessionRepository();

export const roll = async (session: Session) => {
  if (session.balance <= 0) {
    throw new BadRequestError('Insufficient balance');
  }

  let newBalance = session.balance - 1;
  const rollStrategy = RollStrategyFactory.get(session.balance);
  const { rollResult, winCost } = rollStrategy.roll();

  newBalance += winCost;

  const updatedSession = await sessionRepository.updateSessionBalance(
    session.id,
    newBalance
  );

  return {
    rollResult,
    newBalance: updatedSession.balance,
  };
};

export const cashout = async (account: Account, session: Session) => {
  const updatedAccount = await accountRepository.updateAccountBalance(
    account.id,
    account.balance + session.balance
  );

  await sessionRepository.deleteSessionById(session.id);

  return updatedAccount;
};

export const getAccount = async (account: Account, session?: Session) => {
  return {
    id: account.id,
    sessionBalance: session?.balance ?? 0,
    accountBalance: account.balance,
  };
};

export const createSession = async (account: Account, balance: number) => {
  const accountBalance = account.balance;

  if (balance! > accountBalance) {
    throw new BadRequestError("Can't allocate this amount");
  }

  const newSession = await sessionRepository.createSession(
    account.id,
    balance ?? accountBalance
  );

  const updatedAccount = await accountRepository.updateAccountBalance(
    account.id,
    accountBalance - (balance ?? accountBalance)
  );

  return {
    accountId: account.id,
    sessionId: newSession.id,
    sessionBalance: newSession.balance,
    accountBalance: updatedAccount.balance,
  };
};

export const createAccount = async (id: string, balance: number = 10) => {
  return accountRepository.createAccount(id, balance);
};
