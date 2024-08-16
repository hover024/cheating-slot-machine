import { Account, Session } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    account?: Account & { session?: Session };
    session?: Session;
  }
}
