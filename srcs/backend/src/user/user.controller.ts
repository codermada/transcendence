import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/CurrentUser';
import { AuthGuard } from '../auth/AuthGuard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }
}
