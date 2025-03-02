import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MoneyTransactionService } from '../../money-transaction/money-transaction.service';
import { CacheService } from '../cache/cache.service';
import { UserProfileService } from '../../user-profile/user-profile.service';
import { UserProfileEntity } from '../../user-profile/user-profile.entity';
import { Logger } from '@nestjs/common';
import { MoneyTransactionEntity } from '../../money-transaction/money-transaction.entity';

@Processor('weeklyJobQueue')
export class JobProcessorService {
  private readonly logger = new Logger(JobProcessorService.name);
  constructor(
    private userProfileService: UserProfileService,
    private moneyTransactionService: MoneyTransactionService,
    private cacheService: CacheService,
  ) {}

  prepareUserProfileEntities(userProfiles: UserProfileEntity[], awards: Map<string, number>) {
    const moneyTransactions: MoneyTransactionEntity[] = [];
    for (let i = 0; i < userProfiles.length; i++) {
      userProfiles[i].money = awards.has(userProfiles[i].user_id)
        ? Number(userProfiles[i].money) + awards.get(userProfiles[i].user_id)!
        : userProfiles[i].money;
      userProfiles[i].updated_at = new Date();
      moneyTransactions.push({
        user_id: userProfiles[i].user_id,
        amount: awards.get(userProfiles[i].user_id)! | 0,
        created_at: new Date(),
        updated_at: new Date(),
        is_award: true,
      });
    }
    return { userProfiles: userProfiles, moneyTransactions: moneyTransactions };
  }

  @Process('weekly-job')
  async handleJob(job: Job) {
    this.logger.debug('Job started: ', job.id);
    try {
      const userProfiles = await this.userProfileService.findUserProfilesInDb();
      const userProfilesInCache: any = await this.userProfileService.findTop100UserProfiles();
      const weekRange: any = await this.cacheService.getWeekRange();
      const moneyTransaction = await this.moneyTransactionService.collectMoneyForAwardingByDate(
        new Date(weekRange.start_date),
        new Date(weekRange.end_date),
      );
      const calculateAwardedMoney = await this.moneyTransactionService.distributeAwardOnRank(
        userProfilesInCache,
        moneyTransaction.sum_award_money,
      );
      const prepareEntities = this.prepareUserProfileEntities(userProfiles, calculateAwardedMoney);
      await this.userProfileService.updateUserProfiles(prepareEntities.userProfiles);
      await this.moneyTransactionService.createMoneyTransactions(prepareEntities.moneyTransactions);
      await this.cacheService.resetAllUserProfiles();
      await this.cacheService.resetCaches();
      this.logger.debug('Job completed: ', job.id);
    } catch (err: any) {
      this.logger.error(
        `Error accrued, during processing job === jobId: ${job.id}, err: ${err.message}`,
      );
      throw new Error(`Error accrued, during processing job, err: ${err.message}`);
    }
  }
}
