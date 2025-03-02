import { Injectable, Logger } from '@nestjs/common';
import { UserProfileDataAccess } from './user-profile.data-access';
import { UserProfileEntity } from './user-profile.entity';
import { UserProfileAlreadyExistException } from './exceptions/user-profile-already-exist.exception';
import { UpdateUserProfileDto } from './exceptions/update-user-profile.dto';
import { UserProfileNotFoundException } from './exceptions/user-profile-not-found.exception';
import { UpdateMoneyDto } from './dtos/update-money.dto';
import { MoneyTransactionService } from '../money-transaction/money-transaction.service';
import { CreateMoneyTransactionInterface } from '../money-transaction/interfaces/create-money-transaction.interface';
import { calculateMoney } from '../helpers/calculate-money';
import { CacheService } from '../redis/cache/cache.service';
import { UserProfileInCacheDto } from './dtos/user-profile-in-cache.dto';
import { dataTypeConverterFromDbToResponse } from '../helpers/converter';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);
  constructor(
    private userProfileDataAccess: UserProfileDataAccess,
    private moneyTransactionService: MoneyTransactionService,
    private cacheService: CacheService,
  ) {}

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

  async updateUserProfileToIncMoney(userId: string, updateMoneyDto: UpdateMoneyDto) {
    this.logger.debug(`Increasing Money For user: ${userId}, money: ${updateMoneyDto.money}`);
    try {
      const userProfile: UserProfileEntity | null =
        await this.userProfileDataAccess.findUserProfileByUserId(userId, { money: 1, user_id: 1 });

      if (!userProfile) {
        this.logger.error(`User Profile Does Not Exist user :${userId}`);
        throw new UserProfileNotFoundException(`User Profile Is Not Found === user_id = ${userId}`);
      }

      this.logger.debug(`User Profile Is Found === User: ${userId}`);
      const calculatedMoney = calculateMoney(updateMoneyDto.money);
      const incMoney = Number(userProfile.money) + calculatedMoney.amountForOwner;
      const updateUserProfile: UpdateUserProfileDto = {
        money: incMoney,
      };
      await this.userProfileDataAccess.updateUserProfile(userProfile, updateUserProfile);

      const createTransactionDto: CreateMoneyTransactionInterface = {
        user_id: userId,
        amount: updateMoneyDto.money,
      };
      await this.moneyTransactionService.createMoneyTransaction(createTransactionDto);
      const userProfileInCacheDto: UserProfileInCacheDto = {
        user_id: userId,
        money: incMoney,
      };
      await this.cacheService.updateUserProfileInRedis(userProfileInCacheDto);
    } catch (err: any) {
      this.logger.error(`Error accrued. User_id: ${userId} === message: ${err.message}`);
    }
  }

  async findUserProfiles() {
    const respInCache = await this.cacheService.getUserProfiles();
    if (!respInCache || respInCache.length < 1) {
      const dateRange: any = await this.cacheService.getWeekRange();
      const response = await this.moneyTransactionService.findSumMoneyTransactionByDateAndUserId(
        new Date(dateRange.start_date),
        new Date(dateRange.end_date),
      );
      return dataTypeConverterFromDbToResponse(response);
    }
    return respInCache;
  }
}
