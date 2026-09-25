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
  Put,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from '../auth/AdminGuard';
import { AuthGuard } from '../auth/AuthGuard';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';
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
	// Admin — list + count
	// ─────────────────────────────────────────────────────────────

	@ApiOperation({ summary: 'Admin: list all users' })
	@Get()
	@UseGuards(AdminGuard)
	getAllUsers() {
		return this.userService.getAllUsers();
	}

	// Literal route — MUST be declared before `@Get(':id')`.
	@ApiOperation({ summary: 'Admin: count all users' })
	@Get('count')
	@UseGuards(AdminGuard)
	countUsers() {
		return this.userService.countUsers();
	}

	// ─────────────────────────────────────────────────────────────
	// Search — discover users to befriend
	// MUST be declared before `@Get(':id')` so `search` isn't
	// captured by the `:id` param route.
	// ─────────────────────────────────────────────────────────────

	@ApiOperation({
		summary: 'Search users to befriend (excludes self, existing friends, pending requests, and blocked)',
	})
	@Get('search')
	@UseGuards(AuthGuard)
	searchUsers(@CurrentUser() user: { id: string }, @Query() query: SearchUsersQueryDto) {
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
	updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateUserDto) {
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
	updateUserById(@Param('id') id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateUserById(id, dto);
	}

	@ApiOperation({ summary: 'Admin: change a user role by id' })
	@Patch(':id/role')
	@UseGuards(AdminGuard)
	updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto, @CurrentUser() admin: { id: string }) {
		return this.userService.updateUserRole(id, dto.role, admin.id);
	}

	@ApiOperation({ summary: 'Admin: delete a user by id' })
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@UseGuards(AdminGuard)
	deleteUser(@Param('id') id: string, @CurrentUser() admin: { id: string }) {
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

	// ═════════════════════════════════════════════════════════════
	// API-KEY ROUTES (duplicates)  —  /user/api-key/...
	//
	// IMPORTANT: all literal `api-key/...` routes are declared before
	// any `api-key/:id` route so that e.g. `api-key/me` is not
	// captured by `api-key/:id`.
	//
	// All routes below require the header:
	//   x-api-key: YOUR_API_KEY_HERE
	// The key's `referenceId` is used as the acting user id
	// (accessible as `req.apiKey.referenceId`).
	// ═════════════════════════════════════════════════════════════

	// ── Admin: list + count (via API key) ──────────────────────

	/**
	 * List all users.
	 *
	 * curl -i -X GET "https://localhost:9000/nest/user/api-key" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key')
	@ApiOperation({ summary: '[API key] Admin: list all users' })
	getAllUsersViaApiKey() {
		return this.userService.getAllUsers();
	}

	/**
	 * Count all users.
	 *
	 * curl -i -X GET "https://localhost:9000/nest/user/api-key/count" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/count')
	@ApiOperation({ summary: '[API key] Admin: count all users' })
	countUsersViaApiKey() {
		return this.userService.countUsers();
	}

	// ── Search (via API key) ───────────────────────────────────

	/**
	 * Search users to befriend. Excludes self, existing friends,
	 * pending requests, and blocked users. "Self" is derived from
	 * the API key's `referenceId`.
	 *
	 * curl -i -X GET "https://localhost:9000/nest/user/api-key/search?q=alice" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/search')
	@ApiOperation({
		summary: '[API key] Search users to befriend (excludes self, existing friends, pending requests, and blocked)',
	})
	searchUsersViaApiKey(@Req() req: Request, @Query() query: SearchUsersQueryDto) {
		return this.userService.searchUsers(req.apiKey!.referenceId, query);
	}

	// ── Self (via API key) ─────────────────────────────────────

	/**
	 * Get the user associated with the API key.
	 *
	 * curl -i -X GET "https://localhost:9000/nest/user/api-key/me" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/me')
	@ApiOperation({ summary: '[API key] Get current user' })
	getMeViaApiKey(@Req() req: Request) {
		return this.userService.getMe(req.apiKey!.referenceId);
	}

	/**
	 * Update the user associated with the API key.
	 *
	 * curl -i -X PATCH "https://localhost:9000/nest/user/api-key/me" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "content-type: application/json" \
	 *   -H "accept: application/json" \
	 *   -d '{"name":"New Name"}' \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/me')
	@ApiOperation({ summary: '[API key] Update current user' })
	updateMeViaApiKey(@Req() req: Request, @Body() dto: UpdateUserDto) {
		return this.userService.updateMe(req.apiKey!.referenceId, dto);
	}

	/**
	 * Upload an avatar for the user associated with the API key.
	 * Max 5 MB. Allowed types: png, jpg/jpeg, webp, gif.
	 *
	 * curl -i -X PUT "https://localhost:9000/nest/user/api-key/me/avatar" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   -F "file=@./avatar.png" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' },
			},
		},
	})
	@Put('api-key/me/avatar')
	@UseInterceptors(FileInterceptor('file'))
	updateAvatarViaApiKey(
		@Req() req: Request,
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
		return this.userService.updateAvatar(req.apiKey!.referenceId, file);
	}

	/**
	 * Delete the avatar of the user associated with the API key
	 * (resets to default).
	 *
	 * curl -i -X DELETE "https://localhost:9000/nest/user/api-key/me/avatar" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Delete('api-key/me/avatar')
	@ApiOperation({ summary: '[API key] Delete current user avatar (reset to default)' })
	deleteAvatarViaApiKey(@Req() req: Request) {
		return this.userService.deleteAvatar(req.apiKey!.referenceId);
	}

	/**
	 * Delete the account of the user associated with the API key
	 * (self-deletion).
	 *
	 * curl -i -X DELETE "https://localhost:9000/nest/user/api-key/me" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Delete('api-key/me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '[API key] Delete current user account (self-deletion)' })
	deleteMeViaApiKey(@Req() req: Request) {
		return this.userService.deleteMe(req.apiKey!.referenceId);
	}

	// ── Admin — mutate a specific user (via API key) ───────────

	/**
	 * Update a user by id. The API key acts as the admin.
	 *
	 * curl -i -X PATCH "https://localhost:9000/nest/user/api-key/USER_ID" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "content-type: application/json" \
	 *   -H "accept: application/json" \
	 *   -d '{"name":"New Name"}' \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id')
	@ApiOperation({ summary: '[API key] Admin: update a user by id' })
	updateUserByIdViaApiKey(@Param('id') id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateUserById(id, dto);
	}

	/**
	 * Change a user's role by id. The API key's `referenceId` is
	 * recorded as the acting admin.
	 *
	 * curl -i -X PATCH "https://localhost:9000/nest/user/api-key/USER_ID/role" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "content-type: application/json" \
	 *   -H "accept: application/json" \
	 *   -d '{"role":"admin"}' \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/role')
	@ApiOperation({ summary: '[API key] Admin: change a user role by id' })
	updateUserRoleViaApiKey(@Param('id') id: string, @Body() dto: UpdateUserRoleDto, @Req() req: Request) {
		return this.userService.updateUserRole(id, dto.role, req.apiKey!.referenceId);
	}

	/**
	 * Delete a user by id. The API key's `referenceId` is recorded
	 * as the acting admin.
	 *
	 * curl -i -X DELETE "https://localhost:9000/nest/user/api-key/USER_ID" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Delete('api-key/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '[API key] Admin: delete a user by id' })
	deleteUserViaApiKey(@Param('id') id: string, @Req() req: Request) {
		return this.userService.deleteUser(id, req.apiKey!.referenceId);
	}

	// ── Public profile (via API key) — MUST be last ────────────

	/**
	 * Get a user's public profile by id.
	 *
	 * curl -i -X GET "https://localhost:9000/nest/user/api-key/USER_ID" \
	 *   -H "x-api-key: YOUR_API_KEY_HERE" \
	 *   -H "accept: application/json" \
	 *   --insecure
	 */
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/:id')
	@ApiOperation({ summary: '[API key] Get a user public profile by id' })
	getPublicProfileViaApiKey(@Param('id') id: string) {
		return this.userService.getPublicProfile(id);
	}
}
