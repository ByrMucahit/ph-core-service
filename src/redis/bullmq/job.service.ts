import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UsersEntity } from '../../users/users.entity';
import { UsersService } from '../../users/users.service';
import { UserProfileInCacheDto } from '../../user-profile/dtos/user-profile-in-cache.dto';
import { CacheService } from '../cache/cache.service';
import { getWeekRange } from '../../helpers/date-range';
import { MoneyTransactionService } from '../../money-transaction/money-transaction.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue('weeklyJobQueue') private weeklyJobQueue: Queue,
    private cacheService: CacheService,
    private userServices: UsersService,
    private moneyTransactionService: MoneyTransactionService,
  ) {}

  makeUserToUserProfile(users: UsersEntity[], mt: Map<string, number>) {
    const userProfilesInCache: UserProfileInCacheDto[] | null = [];
    for (const user of users) {
      userProfilesInCache?.push({
        user_id: user.id,
        money: Number(mt.get(user.id)) || 0,
        country: user.country,
      });
    }

    return userProfilesInCache;
  }

  async findWeekRange() {
    const weekRange = await this.cacheService.getWeekRange();
    if (!weekRange || Object.keys(weekRange).length < 1) {
      const currentWeekRange = getWeekRange();
      await this.cacheService.setWeekRange(currentWeekRange.start_date, currentWeekRange.end_date);
      return currentWeekRange;
    }
    return weekRange;
  }

  async scheduleWeeklyJobQueue() {
    this.logger.debug('Scheduling job...');
    // await this.weeklyJobQueue.add({}, { repeat: { cron: '0 0 * * 1' } });
    const userInCache = await this.cacheService.getUserProfiles();
    const weekRange: any = await this.findWeekRange();

    if (userInCache.length < 1) {
      this.logger.debug(`There is no data in redis`);
      const users: UsersEntity[] = await this.userServices.findUsers({ id: 1, country: 1 });
      const mapMoneyTransaction =
        await this.moneyTransactionService.findSumMoneyTransactionByDateAndMap(
          new Date(weekRange.start_date),
          new Date(weekRange.end_date),
        );
      const userProfileInMemoryCache = this.makeUserToUserProfile(users, mapMoneyTransaction);
      await this.cacheService.updateMultipleUsers(userProfileInMemoryCache);
    }

    const jobs = await this.weeklyJobQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    ]);
    const existFlag = jobs.some((job) => job.name === 'weekly-job');
    if (!existFlag) {
      this.logger.debug(`Creating weekly job...`);
      await this.weeklyJobQueue.add('weekly-job', { repeat: { every: 10000 } });
    }
  }
}
