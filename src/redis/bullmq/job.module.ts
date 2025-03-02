import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobProcessorService } from './job-processor.service';
import { JobService } from './job.service';
import { JobSchedulerService } from './job-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '../cache/cache.module';
import { UsersModule } from '../../users/users.module';
import { MoneyTransactionModule } from '../../money-transaction/money-transaction.module';
import { UserProfileModule } from '../../user-profile/user-profile.module';

@Module({
  imports: [
    CacheModule,
    UsersModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'weeklyJobQueue',
    }),
    ScheduleModule.forRoot(),
    MoneyTransactionModule,
    UserProfileModule,
  ],
  providers: [JobProcessorService, JobService, JobSchedulerService],
})
export class JobModule {}
