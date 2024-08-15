import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export const validateAccountId = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    return res.status(405).send({ error: "please specify correct account id" });
  }

  const account = await prisma.account.findFirst({
    where: { id },
    include: { session: true },
  });

  if (!account) {
    return res.status(405).send({ error: "please specify correct account id" });
  }

  req.account = {
    ...account,
    session: account.session ?? undefined
  };

  next();
};

export const validateActiveSession = (req: Request, res: Response, next: NextFunction) => {
  const { session } = req.account!;
  if (!session) {
    return res.status(405).send({ error: "no active session" });
  }
  req.session = session;
  next();
};

export const validateSufficientBalance = (req: Request, res: Response, next: NextFunction) => {
  const { balance } = req.session!;
  if (balance <= 0) {
    return res.status(423).send({ error: "give me more money" });
  }
  next();
};
