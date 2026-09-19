import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Normalize header (can be string | string[] | undefined)
    const rawKey = request.headers['x-api-key'];
    const apiKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new UnauthorizedException('API key is missing');
    }

    // 2. Verify with Better Auth
    let result: Awaited<ReturnType<typeof this.authService.api.verifyApiKey>>;
    try {
      result = await this.authService.api.verifyApiKey({
        body: { key: apiKey },
      });
    } catch {
      // Don't leak internal errors (DB/network) to the client
      throw new UnauthorizedException('Invalid API key');
    }

    // 3. Validate result
    if (!result?.valid || !result.key) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (result.key.enabled === false) {
      throw new UnauthorizedException('API key is disabled');
    }

    if (result.key.expiresAt && new Date(result.key.expiresAt) < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // 4. Attach for downstream handlers
    request.apiKey = result.key;
    return true;
  }
}