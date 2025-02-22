import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUsersDto } from './dtos/create-users.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersDataAccess {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async createUser(createUsersDto: CreateUsersDto) {
    const usersEntity = this.usersRepository.create(createUsersDto);
    usersEntity.created_at = new Date();
    usersEntity.updated_at = new Date();
    return this.usersRepository.save(usersEntity);
  }

  async findUsers(projection: { [key: string]: 1 }) {
    return this.usersRepository.find({
      select: projection,
    });
  }
}
