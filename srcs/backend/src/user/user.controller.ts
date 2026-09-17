import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/CurrentUser';
import { AuthGuard } from '../auth/AuthGuard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../auth/AdminGuard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

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

  @ApiOperation({ summary: 'Get a user public profile by id' })
  @Get(':id')
  @UseGuards(AuthGuard)
  getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(id);
  }
}