import { Injectable } from '@nestjs/common';
import { UserProfileDataAccess } from './user-profile.data-access';
import { UserProfileEntity } from './user-profile.entity';
import { UserProfileAlreadyExistException } from './exceptions/user-profile-already-exist.exception';
import { UpdateUserProfileDto } from './exceptions/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private userProfileDataAccess: UserProfileDataAccess) {}

  async createUserProfile(user_id: string) {
    const userProfile: UserProfileEntity | null =
      await this.userProfileDataAccess.findUserProfileByUserId(user_id, { user_id: 1 });

    if (userProfile) throw new UserProfileAlreadyExistException('User Profile Already Exist');

    await this.userProfileDataAccess.createUserProfile({ user_id });
  }

  async updateUserProfile(user_id: string, updateUserProfileDto: UpdateUserProfileDto) {
    const userProfile: UserProfileEntity | null =
      await this.userProfileDataAccess.findUserProfileByUserId(user_id, { user_id: 1 });

    if (!userProfile) throw new UserProfileAlreadyExistException('User Profile Not Found');

    await this.userProfileDataAccess.updateUserProfile(userProfile, updateUserProfileDto);
  }
}
