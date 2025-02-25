import { Injectable, OnModuleInit } from '@nestjs/common';
import { JobService } from './job.service';

@Injectable()
export class JobSchedulerService implements OnModuleInit {
  constructor(private readonly jobService: JobService) {}

  onModuleInit(): any {
    this.jobService.scheduleWeeklyJobQueue();
  }
}
