import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobService {
  constructor(@InjectQueue('weeklyJobQueue') private weeklyJobQueue: Queue) {}

  async scheduleWeeklyJobQueue() {
    console.log('job is starting');
    await this.weeklyJobQueue.add({}, { repeat: { cron: '0 0 * * 1' } });
  }
}
