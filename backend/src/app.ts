import { PrismaClient, Account, Session } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { computeRollResult, getRandomFruit } from './utils';
import { validateAccountId, validateActiveSession, validateSufficientBalance } from './validation';

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

// Роуты
app.post(`/roll/:id`, validateAccountId, validateActiveSession, validateSufficientBalance, async (req, res) => {
  let rollResult = new Array(3).fill(null).map(() => getRandomFruit());
  let winCost = computeRollResult(rollResult);
  let newBalance = req.session!.balance - 1;

  if (winCost && req.session!.balance > 40) {
    const chance = req.session!.balance > 60 ? 60 : 30;
    const shouldRollAgain = Math.random() * 100 <= chance;

    if (shouldRollAgain) {
      rollResult = new Array(3).fill(null).map(() => getRandomFruit());
      winCost = computeRollResult(rollResult);
    }

    newBalance += winCost;
  }

  const updatedSession = await prisma.session.update({
    where: { id: req.session!.id },
    data: { balance: newBalance },
  });

  res.send({
    rollResult,
    newBalance: updatedSession.balance,
  });
});

app.post(`/cashout/:id`, validateAccountId, validateActiveSession, async (req, res) => {
  const updatedAccount = await prisma.account.update({
    where: { id: req.account!.id },
    data: { balance: req.account!.balance + req.session!.balance },
  });

  await prisma.session.delete({
    where: { id: req.session!.id },
  });

  res.send(updatedAccount);
});

app.get(`/accounts/:id`, validateAccountId, async (req, res) => {
  let session = req.account?.session as Session | undefined;

  if (!session) {
    session = await prisma.session.create({
      data: {
        account: { connect: { id: req.account!.id } },
        balance: 10,
      },
    });
  }

  res.json({
    id: req.account!.id,
    balance: session.balance,
  });
});

app.post(`/accounts`, async (req, res) => {
  const { id, balance } = req.body;
  if (!id) {
    return res.status(412).send({ error: "Please specify an id" });
  }

  const result = await prisma.account.create({
    data: {
      id,
      balance: balance ?? 10,
    },
  });
  res.status(201).json(result);
});

export default app;
