import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from './AuthGuard';
import { ApiKeyGuard } from './ApiKeyGuard';

@Injectable()
export class AnyAuthGuard implements CanActivate {
  constructor(
    private readonly authGuard: AuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const raw = request.headers['x-api-key'];
    const hasApiKey =
      (Array.isArray(raw) ? raw[0] : raw)?.trim() !== undefined &&
      (Array.isArray(raw) ? raw[0] : raw)?.trim() !== '';

    // If the client sent an API key, use the API-key path exclusively.
    // Otherwise fall back to cookie/session auth.
    return hasApiKey
      ? this.apiKeyGuard.canActivate(context) as boolean | Promise<boolean>
      : this.authGuard.canActivate(context) as boolean | Promise<boolean>;
  }
}