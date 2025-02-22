import { UsersDataAccess } from './users.data-access';
import { CreateUsersDto } from './dtos/create-users.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private usersDataAccess: UsersDataAccess) {}

  async createUser(createUsersDto: CreateUsersDto) {
    await this.usersDataAccess.createUser(createUsersDto);
  }
}
