import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobProcessorService } from './job-processor.service';
import { JobService } from './job.service';
import { JobSchedulerService } from './job-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModules } from '../cache/redis.module';

@Module({
  imports: [
    RedisModules,
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
  ],
  providers: [JobProcessorService, JobService, JobSchedulerService],
})
export class JobModule {}
