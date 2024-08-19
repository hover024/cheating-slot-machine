import { PrismaClient, Session } from '@prisma/client';

export interface ISessionRepository {
  createSession(accountId: string, balance: number): Promise<Session>;
  findSessionById(id: number): Promise<Session | null>;
  updateSessionBalance(id: number, balance: number): Promise<Session>;
  deleteSessionById(id: number): Promise<void>;
}

export default class SessionRepository implements ISessionRepository {
  private prisma = new PrismaClient();

  async createSession(accountId: string, balance: number): Promise<Session> {
    return this.prisma.session.create({
      data: {
        account: { connect: { id: accountId } },
        balance,
      },
    });
  }

  async findSessionById(id: number): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  async updateSessionBalance(id: number, balance: number): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { balance },
    });
  }

  async deleteSessionById(id: number): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }
}
