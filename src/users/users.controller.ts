import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dtos/create-users.dto';

@Controller('users')
export class UsersController{
  constructor(private usersService: UsersService) {
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createUser(@Body() createUserDto: CreateUsersDto) {

  }
}
