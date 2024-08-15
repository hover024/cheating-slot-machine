import request from 'supertest'
import app from './app'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

describe('Sample Test', () => {
  it('should create a new account', async () => {
    const res = await request(app).post('/accounts').send({
      id: crypto.randomUUID(),
      balance: 0,
    })
    expect(res.statusCode).toEqual(201)
  })
})

describe('POST /roll/:id', () => {
  let accountId: string;

  beforeAll(async () => {
    accountId = crypto.randomUUID();
    await prisma.account.create({
      data: {
        id: accountId,
        balance: 100, 
        session: {
          create: {
            balance: 50,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should return an error if account id is incorrect', async () => {
    const res = await request(app).post(`/roll/${crypto.randomUUID()}`).send();
    expect(res.statusCode).toEqual(405);
    expect(res.body.error).toBe('please specify correct account id');
  });

  it('should return an error if there is no active session', async () => {
    const noSessionAccountId = crypto.randomUUID();
    await prisma.account.create({
      data: {
        id: noSessionAccountId,
        balance: 100,
      },
    });
    const res = await request(app).post(`/roll/${noSessionAccountId}`).send();
    expect(res.statusCode).toEqual(405);
    expect(res.body.error).toBe('no active session');
  });

  it('should return roll result and update balance', async () => {
    const res = await request(app).post(`/roll/${accountId}`).send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.rollResult).toBeDefined();
    expect(res.body.newBalance).toBeLessThan(50);
  });
});

describe('POST /cashout/:id', () => {
  let accountId: string;

  beforeAll(async () => {
    accountId = crypto.randomUUID();
    await prisma.account.create({
      data: {
        id: accountId,
        balance: 100,
        session: {
          create: {
            balance: 50,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should return an error if account id is incorrect', async () => {
    const res = await request(app).post(`/cashout/${crypto.randomUUID()}`).send();
    expect(res.statusCode).toEqual(405);
    expect(res.body.error).toBe('please specify correct account id');
  });

  it('should cash out session balance and delete session', async () => {
    const res = await request(app).post(`/cashout/${accountId}`).send();
    expect(res.statusCode).toEqual(200);
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    expect(account?.balance).toEqual(150);
    const session = await prisma.session.findFirst({ where: { accountId } });
    expect(session).toBeNull(); 
  });
});

describe('GET /accounts/:id', () => {
  let accountId: string;

  beforeAll(async () => {
    accountId = crypto.randomUUID();
    await prisma.account.create({
      data: {
        id: accountId,
        balance: 100,
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should return an error if account id is incorrect', async () => {
    const res = await request(app).get(`/accounts/${crypto.randomUUID()}`);
    expect(res.statusCode).toEqual(405);
    expect(res.body.error).toBe('please specify correct account id');
  });

  it('should create a new session if none exists and return account balance', async () => {
    const res = await request(app).get(`/accounts/${accountId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.balance).toEqual(10);
  });
});

describe('POST /accounts', () => {
  it('should return an error if id is not provided', async () => {
    const res = await request(app).post(`/accounts`).send({ balance: 100 });
    expect(res.statusCode).toEqual(412);
    expect(res.body.error).toBe('Please specify an id');
  });

  it('should create a new account with provided id and balance', async () => {
    const id = crypto.randomUUID();
    const res = await request(app).post(`/accounts`).send({ id, balance: 100 });
    expect(res.statusCode).toEqual(201);
    expect(res.body.id).toBe(id);
    expect(res.body.balance).toBe(100);

    const account = await prisma.account.findUnique({ where: { id } });
    expect(account).toBeTruthy();
    expect(account?.balance).toBe(100);
  });

  it('should create a new account with default balance if none is provided', async () => {
    const id = crypto.randomUUID();
    const res = await request(app).post(`/accounts`).send({ id });
    expect(res.statusCode).toEqual(201);
    expect(res.body.id).toBe(id);
    expect(res.body.balance).toBe(10);

    const account = await prisma.account.findUnique({ where: { id } });
    expect(account).toBeTruthy();
    expect(account?.balance).toBe(10);
  });
});

