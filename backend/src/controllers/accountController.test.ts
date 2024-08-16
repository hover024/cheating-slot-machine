import { PrismaClient } from '@prisma/client';
import {
  roll,
  cashout,
  getAccount,
  createSession,
  createAccount,
} from './accountController';
import { BadRequestError, NotFoundError } from '../lib/errors';

const prisma = new PrismaClient();

describe('Account Controller', () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createAccount', () => {
    it('should create a new account with provided id and balance', async () => {
      const result = await createAccount('test-account', 100);

      expect(result).toEqual(
        expect.objectContaining({ id: 'test-account', balance: 100 })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: 'test-account' },
      });
      expect(accountInDb).toBeTruthy();
    });

    it('should create a new account with default balance if no balance provided', async () => {
      const result = await createAccount('test-account');

      expect(result).toEqual(
        expect.objectContaining({ id: 'test-account', balance: 10 })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: 'test-account' },
      });
      expect(accountInDb?.balance).toBe(10);
    });
  });

  describe('createSession', () => {
    it('should create a new session and update account balance', async () => {
      await createAccount('test-account', 100);

      const result = await createSession('test-account', 50);

      expect(result).toEqual(
        expect.objectContaining({
          accountId: 'test-account',
          sessionId: expect.any(Number),
          sessionBalance: 50,
          accountBalance: 50,
        })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: 'test-account' },
      });
      expect(accountInDb?.balance).toBe(50);

      const sessionInDb = await prisma.session.findFirst({
        where: { accountId: 'test-account' },
      });
      expect(sessionInDb?.balance).toBe(50);
    });

    it('should throw an error if balance exceeds account balance', async () => {
      await createAccount('test-account', 50);

      await expect(createSession('test-account', 100)).rejects.toThrow(
        BadRequestError
      );

      const sessionInDb = await prisma.session.findFirst({
        where: { accountId: 'test-account' },
      });
      expect(sessionInDb).toBeNull();
    });

    it('should throw an error if account does not exist', async () => {
      await expect(createSession('non-existent-account', 50)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('roll', () => {
    it('should return roll result and update balance', async () => {
      await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const session = await prisma.session.create({
        data: {
          account: { connect: { id: 'test-account' } },
          balance: 50,
        },
      });

      const result = await roll(session.id, session.balance);

      expect(result.rollResult).toBeDefined();
      expect(result.newBalance).toBeLessThan(50);

      const sessionInDb = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(sessionInDb?.balance).toBe(result.newBalance);
    });

    it('should throw an error if balance is insufficient', async () => {
      const account = await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const session = await prisma.session.create({
        data: {
          account: { connect: { id: account.id } },
          balance: 0,
        },
      });

      await expect(roll(session.id, session.balance)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('cashout', () => {
    it('should cash out session balance and update account balance', async () => {
      const account = await createAccount('test-account', 100);
      const session = await createSession(account.id, 50);

      const result = await cashout(
        account.id,
        session.sessionId as number,
        account.balance,
        session.sessionBalance as number
      );

      expect(result.balance).toBe(150);

      const accountInDb = await prisma.account.findUnique({
        where: { id: account.id },
      });
      expect(accountInDb?.balance).toBe(150);

      const sessionInDb = await prisma.session.findUnique({
        where: { id: session.sessionId },
      });
      expect(sessionInDb).toBeNull();
    });
  });

  describe('getAccount', () => {
    it('should return account and session balances if session exists', async () => {
      const account = await createAccount('test-account', 100);
      const session = await createSession(account.id, 50);

      const result = await getAccount(account.id, {
        id: session.sessionId as number,
        balance: session.sessionBalance as number,
      });

      expect(result).toEqual({
        id: 'test-account',
        sessionBalance: 50,
        accountBalance: 50,
      });
    });
  });
});
