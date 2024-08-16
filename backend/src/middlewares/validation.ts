import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotFoundError, ForbiddenError } from '../lib/errors';

const prisma = new PrismaClient();

export const validateAccountId = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Please specify correct account id");
    }

    const account = await prisma.account.findFirst({
      where: { id },
      include: { session: true },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    req.account = {
      ...account,
      session: account.session ?? undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const validateActiveSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session } = req.account!;
    if (!session) {
      throw new BadRequestError("No active session");
    }
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateSufficientBalance = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { balance } = req.session!;
    if (balance <= 0) {
      throw new ForbiddenError("Insufficient balance");
    }
    next();
  } catch (error) {
    next(error);
  }
};
