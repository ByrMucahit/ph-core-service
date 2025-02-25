import { Module } from '@nestjs/common';
import { DataSourceModule } from './datasource/typeorm.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './gateway/app-gateway';
import { MoneyTransactionModule } from './money-transaction/money-transaction.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [DataSourceModule, UsersModule, MoneyTransactionModule, RedisModule],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
