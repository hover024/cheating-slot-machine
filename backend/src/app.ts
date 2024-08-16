import { PrismaClient, Account, Session } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import {
  validateAccountId,
  validateActiveSession,
  validateSufficientBalance,
} from './validation';
import {
  roll,
  cashout,
  getAccount,
  createSession,
  createAccount,
} from './controllers/accountController';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

declare module 'express-serve-static-core' {
  interface Request {
    account?: Account & { session?: Session };
    session?: Session;
  }
}

app.post(
  `/roll/:id`,
  validateAccountId,
  validateActiveSession,
  validateSufficientBalance,
  async (req, res) => {
    const result = await roll(req.session!.id, req.session!.balance);
    res.send(result);
  }
);

app.post(`/cashout/:id`, validateAccountId, validateActiveSession, async (req, res) => {
  const result = await cashout(req.account!.id, req.session?.id as number, req.account!.balance, req.session!.balance);
  res.send(result);
});

app.get(`/accounts/:id`, validateAccountId, async (req, res) => {
  const result = await getAccount(req.account!.id, req.account!.session);
  if (result.error) {
    return res.status(412).send(result);
  }
  res.json(result);
});

app.post(`/account/:id/session`, validateAccountId, async (req, res) => {
  if (req.account!.session) {
    return res.status(400).send({
      error: "session already exists",
    });
  }

  try {
    const result = await createSession(req.account!.id, req.body?.balance);

    if (result.error) {
      return res.status(400).send(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error creating session:", error);

    res.status(500).send({
      error: "An unexpected error occurred.",
    });
  }
});

app.post(`/accounts`, async (req, res) => {
  const { id, balance } = req.body;
  if (!id) {
    return res.status(412).send({ error: 'Please specify an id' });
  }

  const result = await createAccount(id, balance);
  res.status(201).json(result);
});

export default app;
