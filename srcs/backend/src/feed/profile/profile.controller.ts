import {
	Controller, Get, UseGuards,
	Param,
} from '@nestjs/common';

import { 
	ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam,
} from '@nestjs/swagger';

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

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiParam({ name: 'id', description: 'Unique identifier of the user', type: String })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getUserProfileById(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
        return this.profileService.getUserProfileById(id, currentUserId);
    }
}
