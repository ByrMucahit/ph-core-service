import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSourceModule } from './datasource/typeorm.module';

@Module({
  imports: [DataSourceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
