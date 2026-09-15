import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/CurrentUser';
import { AuthGuard } from '../auth/AuthGuard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get current user (requires session cookie)' })
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }
}
