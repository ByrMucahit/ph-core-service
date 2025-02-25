import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { JobProcessorService } from './bullmq/job-processor.service';
import { JobService } from './bullmq/job.service';
import { JobSchedulerService } from './bullmq/job-scheduler.service';

@Module({
  imports: [
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
export class RedisModule {}
