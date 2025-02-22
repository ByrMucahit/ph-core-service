import { Module } from '@nestjs/common';
import { DataSourceModule } from './datasource/typeorm.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './gateway/app-gateway';

@Module({
  imports: [DataSourceModule, UsersModule],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
