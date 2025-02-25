import { Body, Controller, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UUIDParam } from '../decorators/http.decorators';
import { UpdateUserProfileDto } from './exceptions/update-user-profile.dto';

@Controller('user-profile')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Post('/:user_id')
  @HttpCode(HttpStatus.OK)
  async createUserProfile(@UUIDParam('user_id') userId: string) {
    return this.userProfileService.createUserProfile(userId);
  }

  @Put('/:user_id')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @UUIDParam('user_id') userId: string,
    @Body() updateUserProfile: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateUserProfile(userId, updateUserProfile);
  }
}
