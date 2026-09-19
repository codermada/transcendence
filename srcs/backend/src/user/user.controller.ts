import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/AdminGuard';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─────────────────────────────────────────────────────────────
  // Admin — list
  // ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Admin: list all users' })
  @Get()
  @UseGuards(AdminGuard)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ─────────────────────────────────────────────────────────────
  // Search — discover users to befriend
  // MUST be declared before `@Get(':id')` so `search` isn't
  // captured by the `:id` param route.
  // ─────────────────────────────────────────────────────────────

  @ApiOperation({
    summary:
      'Search users to befriend (excludes self, existing friends, pending requests, and blocked)',
  })
  @Get('search')
  @UseGuards(AuthGuard)
  searchUsers(
    @CurrentUser() user: { id: string },
    @Query() query: SearchUsersQueryDto,
  ) {
    return this.userService.searchUsers(user.id, query);
  }

  // ─────────────────────────────────────────────────────────────
  // Self
  // ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get current user (requires session cookie)' })
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }

  @ApiOperation({ summary: 'Update current user (requires session cookie)' })
  @Patch('me')
  @UseGuards(AuthGuard)
  updateMe(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMe(user.id, dto);
  }

  @ApiOperation({ summary: 'Upload current user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Patch('me/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(user.id, file);
  }

  @ApiOperation({ summary: 'Delete current user avatar (reset to default)' })
  @Delete('me/avatar')
  @UseGuards(AuthGuard)
  deleteAvatar(@CurrentUser() user: { id: string }) {
    return this.userService.deleteAvatar(user.id);
  }

  @ApiOperation({ summary: 'Delete current user account (self-deletion)' })
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  deleteMe(@CurrentUser() user: { id: string }) {
    return this.userService.deleteMe(user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // Admin — mutate a specific user
  // ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Admin: update a user by id' })
  @Patch(':id')
  @UseGuards(AdminGuard)
  updateUserById(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, dto);
  }

  @ApiOperation({ summary: 'Admin: change a user role by id' })
  @Patch(':id/role')
  @UseGuards(AdminGuard)
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.userService.updateUserRole(id, dto.role, admin.id);
  }

  @ApiOperation({ summary: 'Admin: delete a user by id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.userService.deleteUser(id, admin.id);
  }

  // ─────────────────────────────────────────────────────────────
  // Public profile — must come after all literal `:id` siblings
  // ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get a user public profile by id' })
  @Get(':id')
  @UseGuards(AuthGuard)
  getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(id);
  }
}