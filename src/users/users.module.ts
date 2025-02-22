import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersDataAccess } from './users.data-access';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService, UsersDataAccess],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
