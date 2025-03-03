import { Module } from '@nestjs/common';
import { DataSourceModule } from './datasource/typeorm.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './gateway/app-gateway';
import { MoneyTransactionModule } from './money-transaction/money-transaction.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { JobModule } from './redis/bullmq/job.module';
import { GlobalRedisModule } from './redis/global-redis.module';
import { CacheModule } from './redis/cache/cache.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    DataSourceModule,
    UsersModule,
    MoneyTransactionModule,
    GlobalRedisModule,
    CacheModule,
    UserProfileModule,
    JobModule,
    SeederModule,
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
