import { UsersDataAccess } from './users.data-access';
import { CreateUsersDto } from './dtos/create-users.dto';
import { Injectable } from '@nestjs/common';
import { USERS_ENTITY } from '../constants/users.constants';
import { CreateMoneyTransactionDto } from '../money-transaction/dtos/create-money-transaction.dto';
import { UserNotFoundExceptions } from './exceptions/user-not-found.exceptions';
import { MoneyTransactionService } from '../money-transaction/money-transaction.service';

@Injectable()
export class UsersService {
  constructor(
    private usersDataAccess: UsersDataAccess,
    private moneyTransactionService: MoneyTransactionService,
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
    await this.usersDataAccess.createUser(createUsersDto);
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
}
