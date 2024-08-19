import { Account, Session } from '@prisma/client';
import {
  roll,
  cashout,
  getAccount,
  createSession,
  createAccount,
} from './accountController';
import { BadRequestError, NotFoundError } from '../lib/errors';
import { IAccountRepository } from '../repositories/accountRepository';
import { ISessionRepository } from '../repositories/sessionRepository';

// Моки для репозиториев
const mockAccountRepository: jest.Mocked<IAccountRepository> = {
  createAccount: jest.fn(),
  findAccountById: jest.fn(),
  updateAccountBalance: jest.fn(),
};

const mockSessionRepository: jest.Mocked<ISessionRepository> = {
  createSession: jest.fn(),
  findSessionById: jest.fn(),
  updateSessionBalance: jest.fn(),
  deleteSessionById: jest.fn(),
};

describe('Account Controller', () => {
  let account: Account;
  let session: Session | null;

  beforeEach(() => {
    const now = new Date();

    account = {
      id: `test-account-${Date.now()}`, // Уникальный ID для каждого теста
      balance: 100,
      createdAt: now,
      updatedAt: now,
    };

    session = {
      id: 1,
      balance: 50,
      accountId: account.id,
    };

    jest.clearAllMocks();

    // Настройка моков
    mockAccountRepository.findAccountById.mockResolvedValue(account);
    mockAccountRepository.createAccount.mockResolvedValue(account);
    mockSessionRepository.findSessionById.mockResolvedValue(session);
  });

  describe('createAccount', () => {
    it('should create a new account with provided id and balance', async () => {
      const result = await createAccount(account.id, 100);

      expect(result).toEqual(
        expect.objectContaining({ id: account.id, balance: 100 })
      );
      expect(mockAccountRepository.createAccount).toHaveBeenCalledWith(
        account.id,
        100
      );
    });

    it('should create a new account with default balance if no balance provided', async () => {
      account.balance = 10;
      mockAccountRepository.createAccount.mockResolvedValue(account);

      const result = await createAccount(account.id);

      expect(result).toEqual(
        expect.objectContaining({ id: account.id, balance: 10 })
      );
      expect(mockAccountRepository.createAccount).toHaveBeenCalledWith(
        account.id,
        10
      );
    });
  });

  describe('createSession', () => {
    it('should create a new session and update account balance', async () => {
      mockSessionRepository.createSession.mockResolvedValue(session!);
      mockAccountRepository.updateAccountBalance.mockResolvedValue({
        ...account,
        balance: 50,
      });

      const result = await createSession(account, 50);

      expect(result).toEqual(
        expect.objectContaining({
          accountId: account.id,
          sessionId: 1,
          sessionBalance: 50,
          accountBalance: 50,
        })
      );

      expect(mockSessionRepository.createSession).toHaveBeenCalledWith(
        account.id,
        50
      );
      expect(mockAccountRepository.updateAccountBalance).toHaveBeenCalledWith(
        account.id,
        50
      );
    });

    it('should throw an error if balance exceeds account balance', async () => {
      await expect(createSession(account, 150)).rejects.toThrow(
        BadRequestError
      );

      expect(mockSessionRepository.createSession).not.toHaveBeenCalled();
      expect(mockAccountRepository.updateAccountBalance).not.toHaveBeenCalled();
    });

    it('should throw an error if account does not exist', async () => {
      mockAccountRepository.findAccountById.mockResolvedValue(null);

      await expect(createSession(account, 50)).rejects.toThrow(NotFoundError);

      expect(mockSessionRepository.createSession).not.toHaveBeenCalled();
      expect(mockAccountRepository.updateAccountBalance).not.toHaveBeenCalled();
    });
  });

  describe('roll', () => {
    it('should return roll result and update balance', async () => {
      mockSessionRepository.updateSessionBalance.mockResolvedValue({
        ...session!,
        balance: 40,
      });

      const result = await roll(session!);

      expect(result.rollResult).toBeDefined();
      expect(result.newBalance).toBeLessThan(50);

      expect(mockSessionRepository.updateSessionBalance).toHaveBeenCalledWith(
        session!.id,
        expect.any(Number)
      );
    });

    it('should throw an error if balance is insufficient', async () => {
      session!.balance = 0;

      await expect(roll(session!)).rejects.toThrow(BadRequestError);

      expect(mockSessionRepository.updateSessionBalance).not.toHaveBeenCalled();
    });
  });

  describe('cashout', () => {
    it('should cash out session balance and update account balance', async () => {
      mockAccountRepository.updateAccountBalance.mockResolvedValue({
        ...account,
        balance: 150,
      });

      const result = await cashout(account, session!);

      expect(result.balance).toBe(150);
      expect(mockAccountRepository.updateAccountBalance).toHaveBeenCalledWith(
        account.id,
        150
      );
      expect(mockSessionRepository.deleteSessionById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAccount', () => {
    it('should return account and session balances if session exists', async () => {
      const result = await getAccount(account, session!);

      expect(result).toEqual({
        id: account.id,
        sessionBalance: 50,
        accountBalance: 100,
      });
    });

    it('should return account balance and zero session balance if session does not exist', async () => {
      session = null;

      const result = await getAccount(account);

      expect(result).toEqual({
        id: account.id,
        sessionBalance: 0,
        accountBalance: 100,
      });
    });
  });
});
