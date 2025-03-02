import { UsersDataAccess } from './users.data-access';
import { CreateUsersDto } from './dtos/create-users.dto';
import { Injectable } from '@nestjs/common';
import { USERS_ENTITY } from '../constants/users.constants';
import { CreateMoneyTransactionDto } from '../money-transaction/dtos/create-money-transaction.dto';
import { UserNotFoundExceptions } from './exceptions/user-not-found.exceptions';
import { MoneyTransactionService } from '../money-transaction/money-transaction.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import { CacheService } from '../redis/cache/cache.service';
import { UserProfileInCacheDto } from '../user-profile/dtos/user-profile-in-cache.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersDataAccess: UsersDataAccess,
    private moneyTransactionService: MoneyTransactionService,
    private userProfileService: UserProfileService,
    private cacheService: CacheService,
  ) {}

  private decorateProjectionObject(projection?: string) {
    const currentProjection = {};
    if (projection) {
      const array: string[] = projection.split(' ');
      array.forEach((element) => {
        if (USERS_ENTITY.has(element)) currentProjection[element] = 1;
      });
    }
    return currentProjection;
  }

  async createUser(createUsersDto: CreateUsersDto) {
    const user = await this.usersDataAccess.createUser(createUsersDto);
    await this.userProfileService.createUserProfile(user.id);
    const userProfiles: UserProfileInCacheDto = {
      user_id: user.id,
      money: 0,
    };
    await this.cacheService.addOrUpdateUser(userProfiles);
  }

  async findUsers(projection: string | { [key: string]: 1 }) {
    const decoratedProjection: { [key: string]: 1 } =
      typeof projection === 'string' ? this.decorateProjectionObject(projection) : projection;
    return this.usersDataAccess.findUsers(decoratedProjection);
  }

  async makeMoney(createMoneyTransaction: CreateMoneyTransactionDto, userId: string) {
    const user = await this.usersDataAccess.findUserById(userId, { id: 1 });
    if (!user) throw new UserNotFoundExceptions();
    const createTransactionDto: any = {
      user_id: userId,
      amount: createMoneyTransaction.amount,
    };
    await this.moneyTransactionService.createMoneyTransaction(createTransactionDto);
  }

  async findUserById(user_id: string, projection: string | { [key: string]: 1 }) {
    const decoratedProjection: { [key: string]: 1 } =
      typeof projection === 'string' ? this.decorateProjectionObject(projection) : projection;

    return this.usersDataAccess.findUserById(user_id, decoratedProjection);
  }
}
