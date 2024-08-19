import { PrismaClient } from '@prisma/client';
import {
  roll,
  cashout,
  getAccount,
  createSession,
  createAccount,
} from './accountController';

const prisma = new PrismaClient();

describe('Account Controller', () => {
  beforeEach(async () => {
    // Очистка базы данных перед каждым тестом
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createAccount', () => {
    it('should create a new account with provided id and balance', async () => {
      const accountId = `test-account-${Date.now()}`;
      const result = await createAccount(accountId, 100);

      expect(result).toEqual(
        expect.objectContaining({ id: accountId, balance: 100 })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: accountId },
      });
      expect(accountInDb).toBeTruthy();
      expect(accountInDb?.balance).toBe(100);
    });

    it('should create a new account with default balance if no balance provided', async () => {
      const accountId = `test-account-${Date.now()}`;
      const result = await createAccount(accountId);

      expect(result).toEqual(
        expect.objectContaining({ id: accountId, balance: 10 })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: accountId },
      });
      expect(accountInDb).toBeTruthy();
      expect(accountInDb?.balance).toBe(10);
    });
  });

  describe('createSession', () => {
    it('should create a new session and update account balance', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);

      const result = await createSession(account, 50);

      expect(result).toEqual(
        expect.objectContaining({
          accountId: account.id,
          sessionId: expect.any(Number),
          sessionBalance: 50,
          accountBalance: 50,
        })
      );

      const accountInDb = await prisma.account.findUnique({
        where: { id: account.id },
      });
      expect(accountInDb?.balance).toBe(50);

      const sessionInDb = await prisma.session.findFirst({
        where: { accountId: account.id },
      });
      expect(sessionInDb?.balance).toBe(50);
    });

    it('should throw an error if balance exceeds account balance', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 50);

      await expect(createSession(account, 100)).rejects.toThrow(
        "Can't allocate this amount"
      );

      const sessionInDb = await prisma.session.findFirst({
        where: { accountId: account.id },
      });
      expect(sessionInDb).toBeNull();
    });
  });

  describe('roll', () => {
    it('should return roll result and update balance', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);
      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 50,
        },
      });

      const result = await roll(session);

      expect(result.rollResult).toBeDefined();
      expect(result.newBalance).toBeLessThan(50);

      const sessionInDb = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(sessionInDb?.balance).toBe(result.newBalance);
    });

    it('should throw an error if balance is insufficient', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);
      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 0,
        },
      });

      await expect(roll(session)).rejects.toThrow('Insufficient balance');
    });
  });

  describe('cashout', () => {
    it('should cash out session balance and update account balance', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);
      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 50,
        },
      });

      const result = await cashout(account, session);

      expect(result.balance).toBe(150);

      const accountInDb = await prisma.account.findUnique({
        where: { id: account.id },
      });
      expect(accountInDb?.balance).toBe(150);

      const sessionInDb = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(sessionInDb).toBeNull();
    });
  });

  describe('getAccount', () => {
    it('should return account and session balances if session exists', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);
      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 50,
        },
      });

      const result = await getAccount(account, session);

      expect(result).toEqual({
        id: account.id,
        sessionBalance: 50,
        accountBalance: 100,
      });
    });

    it('should return account balance and zero session balance if session does not exist', async () => {
      const account = await createAccount(`test-account-${Date.now()}`, 100);

      const result = await getAccount(account);

      expect(result).toEqual({
        id: account.id,
        sessionBalance: 0,
        accountBalance: 100,
      });
    });
  });
});
