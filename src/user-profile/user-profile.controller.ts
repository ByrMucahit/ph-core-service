import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UUIDParam } from '../decorators/http.decorators';

@Controller('user-profile')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Post('/:user_id')
  @HttpCode(HttpStatus.OK)
  async createUserProfile(@UUIDParam('user_id') userId: string) {
    return this.userProfileService.createUserProfile(userId);
  }
}
