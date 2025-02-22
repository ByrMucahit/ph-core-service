import { Module } from '@nestjs/common';
import { DataSourceModule } from './datasource/typeorm.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DataSourceModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
