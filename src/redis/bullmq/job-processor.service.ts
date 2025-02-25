import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('weeklyJobQueue')
export class JobProcessorService {
  @Process()
  async handleJob(job: Job) {
    console.log('Job started: ', job.id);

    console.log('Job completed: ', job.id);
  }
}
