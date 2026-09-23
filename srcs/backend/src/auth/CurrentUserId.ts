import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

type AuthedRequest = Request & {
  user?: { id: string };
  apiKey?: { referenceId?: string; userId?: string };
};

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();

    // Adjust this line to whichever field holds the user id.
    const id = req.apiKey?.referenceId ?? req.user?.id;
    if (!id) {
      throw new UnauthorizedException('No authenticated identity on request');
    }
    return id;
  },
);