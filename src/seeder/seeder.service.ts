import { faker } from '@faker-js/faker';
import { UsersService } from '../users/users.service';
import { CreateUsersDto } from '../users/dtos/create-users.dto';
import { Injectable } from '@nestjs/common';
import { COUNTRIES } from '../constants/countries.constants';

@Injectable()
export class SeederService {
  constructor(private usersService: UsersService) {}

  async createMultipleUser(count: number) {
    for (let i = 0; i < count; i++) {
      const user: CreateUsersDto = {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        username: faker.person.middleName(),
        country: COUNTRIES[this.getRandomNumber(0, COUNTRIES.length - 1)],
      };
      await this.usersService.createUser(user);
    }
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
