import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dtos/create-users.dto';

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
}
