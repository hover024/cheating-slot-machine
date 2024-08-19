import { PrismaClient, Account } from '@prisma/client';

export interface IAccountRepository {
  createAccount(id: string, balance: number): Promise<Account>;
  findAccountById(id: string): Promise<Account | null>;
  updateAccountBalance(id: string, balance: number): Promise<Account>;
}

export class AccountRepository implements IAccountRepository {
  private prisma = new PrismaClient();

  async createAccount(id: string, balance: number): Promise<Account> {
    return this.prisma.account.create({
      data: {
        id,
        balance,
      },
    });
  }

  async findAccountById(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: { session: true },
    });
  }

  async updateAccountBalance(id: string, balance: number): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { balance },
    });
  }
}
