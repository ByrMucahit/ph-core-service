import { Module } from '@nestjs/common';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SeederService],
  controllers: [SeederController],
})
export class SeederModule {}
