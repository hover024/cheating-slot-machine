import cors from 'cors';
import express from 'express';
import {
  validateAccountId,
  validateActiveSession,
  validateSufficientBalance,
} from './middlewares/validation';
import {
  roll,
  cashout,
  getAccount,
  createSession,
  createAccount,
} from './controllers/accountController';
import { errorHandler } from './middlewares/errorHandler';
import { BadRequestError } from './lib/errors';

const app = express();

app.use(express.json());
app.use(cors());

app.post(
  `/roll/:id`,
  validateAccountId,
  validateActiveSession,
  validateSufficientBalance,
  async (req, res, next) => {
    try {
      const result = await roll(req.session!);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  `/cashout/:id`,
  validateAccountId,
  validateActiveSession,
  async (req, res, next) => {
    try {
      const result = await cashout(req.account!, req.session!);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

app.get(`/accounts/:id`, validateAccountId, async (req, res, next) => {
  try {
    const result = await getAccount(req.account!, req.account!.session);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post(`/accounts/:id/session`, validateAccountId, async (req, res, next) => {
  try {
    if (req.account!.session) {
      throw new BadRequestError('Session already exists');
    }

    const result = await createSession(req.account!, req.body?.balance);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post(`/accounts`, async (req, res, next) => {
  try {
    const { id, balance } = req.body;
    if (!id) {
      throw new BadRequestError('Please specify an id');
    }

    const result = await createAccount(id, balance);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;
