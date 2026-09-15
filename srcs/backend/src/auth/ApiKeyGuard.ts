// api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth'; // Your auth instance

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private authService: AuthService<typeof auth>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    try {
      // Verify the API key using Better Auth's API
      const result = await this.authService.api.verifyApiKey({
        body: { key: apiKey },
      });

      if (!result.valid) {
        throw new UnauthorizedException('Invalid API key');
      }

      // Optionally attach the API key details to the request for later use
      request.apiKey = result.key;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}