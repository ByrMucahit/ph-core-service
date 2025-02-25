import { Injectable } from '@nestjs/common';
import { UserProfileDataAccess } from './user-profile.data-access';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/users.entity';
import { UserNotFoundExceptions } from '../users/exceptions/user-not-found.exceptions';
import { UserProfileEntity } from './user-profile.entity';
import { UserProfileAlreadyExistException } from './exceptions/user-profile-already-exist.exception';

@Injectable()
export class UserProfileService {
  constructor(
    private userProfileDataAccess: UserProfileDataAccess,
    private userService: UsersService,
  ) {}

  async createUserProfile(user_id: string) {
    const user: UsersEntity | null = await this.userService.findUserById(user_id, { id: 1 });
    if (!user) throw new UserNotFoundExceptions();

    const userProfile: UserProfileEntity | null =
      await this.userProfileDataAccess.findUserProfileByUserId(user.id, { user_id: 1 });

    if (userProfile) throw new UserProfileAlreadyExistException('User Profile Already Exist');

    await this.userProfileDataAccess.createUserProfile({ user_id: user.id });
  }
}
