import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../cache/cache.module';
import { UsersEntity } from '../../users/users.entity';
import { UsersService } from '../../users/users.service';
import { UserProfileInCacheDto } from '../../user-profile/dtos/user-profile-in-cache.dto';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue('weeklyJobQueue') private weeklyJobQueue: Queue,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
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
    const userInCache = await this.getUserProfilesInCache();
    if (userInCache.length < 1) {
      this.logger.debug(`There is not data in redis`);
      const users: UsersEntity[] = await this.userServices.findUsers({ id: 1 });
      const userProfileInMemoryCache = this.makeUserToUserProfile(users);
      await this.updateMultipleUsers(userProfileInMemoryCache);
    }
    const jobs = await this.weeklyJobQueue.getJobs([
      'waiting',
      'active',
      'delayed',
      'completed',
      'failed',
    ]);
    const existFlag = jobs.some((job) => job.name === 'weekly-job');
    if (!existFlag) {
      this.logger.debug(`Creating weekly job...`);
      await this.weeklyJobQueue.add('weekly-job', { repeat: { every: 10000 } });
    }
  }

  async getUserProfilesInCache() {
    const users = await this.redisClient.zrevrange('ordered_user_profile_on_money', 0, -1);
    return users.map((user) => JSON.parse(user));
  }

  async updateMultipleUsers(userProfiles: UserProfileInCacheDto[]) {
    const pipeline = this.redisClient.pipeline();

    for (const user of userProfiles) {
      const userString = JSON.stringify(user);
      pipeline.zadd('ordered_user_profile_on_money', user.money, userString);
    }
    await pipeline.exec();
  }
}
