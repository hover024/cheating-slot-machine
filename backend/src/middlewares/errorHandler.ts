import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../lib/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ error: err.message });
  }

  console.error(err);

  res.status(500).send({
    error: 'An unexpected error occurred',
  });
};
