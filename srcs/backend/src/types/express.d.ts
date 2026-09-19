import type { ApiKey } from 'better-auth/plugins';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
    }
  }
}

export {};