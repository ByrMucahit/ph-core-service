import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { GlobalRedisService } from '../globa-redis.service';
import { UserProfileInCacheDto } from '../../user-profile/dtos/user-profile-in-cache.dto';
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis;
  constructor(private readonly redisService: GlobalRedisService) {
    this.client = this.redisService.getClient();
  }

  async getUserProfiles() {
    const users = await this.client.zrevrange('ordered_user_profile_on_money', 0, -1, 'WITHSCORES');
    const result: any = [];
    for (let i = 0; i < users.length; i += 2) {
      const userId = users[i];
      const money = parseFloat(users[i + 1]);
      result.push({ userId, money });
    }
    return result;
  }

  async getWeekRange() {
    const dateRangeInString = await this.client.hgetall('date_range_key');
    if (dateRangeInString) return dateRangeInString;
    return null;
  }

  async setWeekRange(startDate: Date, endDate: Date) {
    await this.client.hset(
      'date_range_key',
      'start_date',
      String(startDate),
      'end_date',
      String(endDate),
    );
  }

  async updateUserProfileInRedis(userProfileInCacheDto: UserProfileInCacheDto) {
    this.logger.debug(
      `Redis Updating... == user_id: ${userProfileInCacheDto.user_id}, money: ${userProfileInCacheDto.money}`,
    );
    const ordered = await this.client.zadd(
      'ordered_user_profile_on_money',
      userProfileInCacheDto.money,
      userProfileInCacheDto.user_id,
    );
    await this.addOrUpdateUser(userProfileInCacheDto);
    console.log('ordered: ', ordered);
  }

  async findUserById(userId: string) {
    const user = await this.client.hgetall(`user:${userId}`);
    if (user && user.userId) {
      return { userId: user.userId, money: parseFloat(user.money) };
    }
    return null;
  }

  async addOrUpdateUser(userProfiles: UserProfileInCacheDto): Promise<void> {
    // Sorted Set'e ekle (money skor olarak kullanılır)
    await this.client.zadd(
      'ordered_user_profile_on_money',
      userProfiles.money,
      userProfiles.user_id,
    );

    // Hash'e kullanıcı bilgilerini ekle
    await this.client.hset(
      `user:${userProfiles.user_id}`,
      'userId',
      userProfiles.user_id,
      'money',
      userProfiles.money,
    );
  }

  async updateMultipleUsers(userProfiles: UserProfileInCacheDto[]) {
    const pipeline = this.client.pipeline();

    for (const user of userProfiles) {
      pipeline.zadd('ordered_user_profile_on_money', user.money, user.user_id);
      pipeline.hset(`user:${user.user_id}`, 'userId', user.user_id, 'money', user.money);
    }
    await pipeline.exec();
  }

  async findTop100UserProfilesOrderByMoney() {
    const key = 'ordered_user_profile_on_money';
    const start = 0;
    const stop = 99;

    const result = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
    const topUsers: any = [];
    for (let i = 0; i < result.length; i += 2) {
      const userId = result[i];
      const money = parseFloat(result[i + 1]);
      topUsers.push({ userId, money });
    }

    return topUsers;
  }

  async resetAllUserProfiles() {
    const key = 'ordered_user_profile_on_money';
    const batchSize = 10000;
    let cursor = 0;

    do {
      const [newCursor, members] = await this.client.zscan(key, cursor, 'COUNT', batchSize);
      cursor = parseInt(newCursor, 10);
      if (members.length > 0) {
        const args = members.flatMap((member) => [0, member]);
        await this.client.zadd(key, ...args);
      }
    } while (cursor !== 0);
  }
}
