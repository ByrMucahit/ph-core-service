import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UsersEntity } from '../../users/users.entity';
import { UsersService } from '../../users/users.service';
import { UserProfileInCacheDto } from '../../user-profile/dtos/user-profile-in-cache.dto';
import { CacheService } from '../cache/cache.service';
import { getWeekRange } from '../../helpers/date-range';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue('weeklyJobQueue') private weeklyJobQueue: Queue,
    private cacheService: CacheService,
    private userServices: UsersService,
  ) {}

  makeUserToUserProfile(users: UsersEntity[]) {
    const userProfilesInCache: UserProfileInCacheDto[] | null = [];
    for (const user of users) {
      userProfilesInCache?.push({
        user_id: user.id,
        money: 0,
      });
    }

    return userProfilesInCache;
  }

  async scheduleWeeklyJobQueue() {
    this.logger.debug('Scheduling job...');
    // await this.weeklyJobQueue.add({}, { repeat: { cron: '0 0 * * 1' } });
    const userInCache = await this.cacheService.getUserProfiles();
    if (userInCache.length < 1) {
      this.logger.debug(`There is not data in redis`);
      const users: UsersEntity[] = await this.userServices.findUsers({ id: 1 });
      const userProfileInMemoryCache = this.makeUserToUserProfile(users);
      await this.cacheService.updateMultipleUsers(userProfileInMemoryCache);
    }

    const weekRange = await this.cacheService.getWeekRange();
    if (!weekRange) {
      const currentWeekRange = getWeekRange();
      await this.cacheService.setWeekRange(currentWeekRange.firstDay, currentWeekRange.lastDay);
    }

    const jobs = await this.weeklyJobQueue.getJobs(['active']);
    const existFlag = jobs.some((job) => job.name === 'weekly-job');
    if (!existFlag) {
      this.logger.debug(`Creating weekly job...`);
      await this.weeklyJobQueue.add('weekly-job', { repeat: { every: 10000 } });
    }
  }
}
