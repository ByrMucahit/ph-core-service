import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UsersService } from '../../users/users.service';
import { MoneyTransactionService } from '../../money-transaction/money-transaction.service';
import { CacheService } from '../cache/cache.service';
import { UserProfileService } from '../../user-profile/user-profile.service';

@Processor('weeklyJobQueue')
export class JobProcessorService {
  constructor(
    private usersService: UsersService,
    private userProfileService: UserProfileService,
    private moneyTransactionService: MoneyTransactionService,
    private cacheService: CacheService,
  ) {}

  @Process('weekly-job')
  async handleJob(job: Job) {
    console.log('Job started: ', job.id);
    const users = await this.usersService.findUsers({ id: 1 });
    const userProfiles = await this.userProfileService.findTop100UserProfiles();
    console.log('users: ', users, userProfiles);
    const weekRange: any = await this.cacheService.getWeekRange();
    const moneyTransaction = await this.moneyTransactionService.collectMoneyForAwardingByDate(
      new Date(weekRange.start_date),
      new Date(weekRange.end_date),
    );
    await this.moneyTransactionService.distributeAwardOnRank(
      userProfiles,
      moneyTransaction.sum_award_money,
    );
    console.log(moneyTransaction);
    await this.cacheService.resetAllUserProfiles();
    console.log('Job completed: ', job.id);
  }
}
