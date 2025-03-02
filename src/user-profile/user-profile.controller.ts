import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Put } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UUIDParam } from '../decorators/http.decorators';
import { UpdateUserProfileDto } from './exceptions/update-user-profile.dto';
import { UpdateMoneyDto } from './dtos/update-money.dto';

@Controller('user-profile')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);
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

  @Put('/:user_id/money')
  @HttpCode(HttpStatus.OK)
  async updateMoney(
    @UUIDParam('user_id') userId: string,
    @Body() updateUserProfileForMoney: UpdateMoneyDto,
  ) {
    this.logger.debug(
      `Update User Profile to Increase Money === user_id: ${userId}, money: ${updateUserProfileForMoney.money}`,
    );
    await this.userProfileService.updateUserProfileToIncMoney(userId, updateUserProfileForMoney);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findUserProfiles() {
    return this.userProfileService.findUserProfiles();
  }
}
