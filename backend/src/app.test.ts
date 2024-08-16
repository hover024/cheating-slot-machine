import request from 'supertest';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Routes', () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /accounts', () => {
    it('should create a new account', async () => {
      const res = await request(app).post('/accounts').send({
        id: 'test-account',
        balance: 100,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({ id: 'test-account', balance: 100 })
      );
    });
  });

  describe('POST /account/:id/session', () => {
    it('should create a new session', async () => {
      await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const res = await request(app)
        .post('/account/test-account/session')
        .send({ balance: 50 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          accountId: 'test-account',
          sessionId: expect.any(Number),
          sessionBalance: 50,
          accountBalance: 50,
        })
      );
    });

    it('should return error if balance exceeds account balance', async () => {
      await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 50,
        },
      });

      const res = await request(app)
        .post('/account/test-account/session')
        .send({ balance: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Can't allocate this amount");
    });
  });

  describe('GET /accounts/:id', () => {
    it('should return account and session balances', async () => {
      await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });
    
      await prisma.session.create({
        data: {
          account: { connect: { id: 'test-account' } },
          balance: 10,
        },
      });
    
      const res = await request(app).get('/accounts/test-account');
    
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        id: 'test-account',
        sessionBalance: 10, 
        accountBalance: 100,
      });
    });

    it('should return error if no session exists', async () => {
      await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const res = await request(app).get('/accounts/test-account');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('No active session found');
    });
  });

  describe('POST /roll/:id', () => {
    it('should return roll result', async () => {
      const account = await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 50,
        },
      });

      const res = await request(app).post(`/roll/${account.id}`).send();

      expect(res.statusCode).toBe(200);
      expect(res.body.rollResult).toBeDefined();
      expect(res.body.newBalance).toBeLessThan(50);
    });

    it('should return error if balance is insufficient', async () => {
      const account = await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 0,
        },
      });

      const res = await request(app).post(`/roll/${account.id}`).send();

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Insufficient balance');
    });
  });

  describe('POST /cashout/:id', () => {
    it('should cash out session balance', async () => {
      const account = await prisma.account.create({
        data: {
          id: 'test-account',
          balance: 100,
        },
      });

      const session = await prisma.session.create({
        data: {
          accountId: account.id,
          balance: 50,
        },
      });

      const res = await request(app).post(`/cashout/${account.id}`).send();

      expect(res.statusCode).toBe(200);
      expect(res.body.balance).toBe(150);
    });
  });
});
