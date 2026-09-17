import {
  Controller,
  All,
  Req,
  Res,
  Post
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';

@Controller('auth')
export class AuthController {
  private readonly handler = toNodeHandler(auth);

  @All('{*paths}')
  async handle(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.handler(req, res);
  }
  
}