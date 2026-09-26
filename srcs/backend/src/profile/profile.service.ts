import { 
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) {}


    private formatUserProfile(userProfile: any) {
        return {
            name: userProfile.name,
            username: userProfile.username,
            initials: userProfile.initials,
            stats: {
                friendsCount: userProfile.friendsCount,
                postsCount: userProfile.postsCount,
                reactionsCount: userProfile.reactionsCount,
            },
        };
    }

    async getUserProfileById(id: string) {
    
        const userProfile = await this.profileRepository.findById(id);

        if (!userProfile) {
            throw new NotFoundException(`User not found with ID: ${id}`);
        }
        return this.formatUserProfile(userProfile);
    }
}
