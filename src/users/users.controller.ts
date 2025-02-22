import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dtos/create-users.dto';
import { UUIDParam } from '../decorators/http.decorators';
import { CreateMoneyTransactionDto } from '../money-transaction/dtos/create-money-transaction.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createUser(@Body() createUserDto: CreateUsersDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query('projection') projection: string) {
    return this.usersService.findUsers(projection);
  }

  @Post('/:user_id/money')
  @HttpCode(HttpStatus.OK)
  async makeMoney(
    @UUIDParam('user_id') userId: Uuid,
    @Body() createMoneyTransactionDto: CreateMoneyTransactionDto,
  ) {
    await this.usersService.makeMoney(createMoneyTransactionDto, userId);
  }
}
