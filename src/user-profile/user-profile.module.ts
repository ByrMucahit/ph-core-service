import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileDataAccess } from './user-profile.data-access';
import { MoneyTransactionModule } from '../money-transaction/money-transaction.module';
import { CacheModule } from '../redis/cache/cache.module';
import { GlobalRedisModule } from '../redis/global-redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfileEntity]),
    MoneyTransactionModule,
    CacheModule,
    GlobalRedisModule,
  ],
  providers: [UserProfileService, UserProfileDataAccess],
  controllers: [UserProfileController],
  exports: [UserProfileService],
})
export class UserProfileModule {}
