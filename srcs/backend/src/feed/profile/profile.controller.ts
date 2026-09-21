import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/AuthGuard';
import { CurrentUser } from '../../auth/CurrentUser';
import { ProfileService } from './profile.service';

@ApiTags('feed profile')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('feed-profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@ApiOperation({ summary: 'Retrieve current user profile' })
	@ApiResponse({ status: 200, description: 'Informations of current user retrieved successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getUserProfile(@CurrentUser('id') currentUserId: string) {
		return this.profileService.getUserProfile(currentUserId);
	}
}
