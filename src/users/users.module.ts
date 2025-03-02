import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersDataAccess } from './users.data-access';
import { MoneyTransactionModule } from '../money-transaction/money-transaction.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { CacheModule } from '../redis/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity]),
    MoneyTransactionModule,
    UserProfileModule,
    CacheModule,
  ],
  providers: [UsersService, UsersDataAccess],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
