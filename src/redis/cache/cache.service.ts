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
      pipeline.hset(
        `user:${user.user_id}`,
        'user_id',
        user.user_id,
        'money',
        user.money,
        'country',
        user.country || '',
      );
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

  async resetCaches() {
    const date: any = await this.getWeekRange();
    await this.setWeekRange(date.start_date, date.end_date);
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

  async getUsersWithCustomRule(userId: string) {
    const key = 'ordered_user_profile_on_money';

    const userRank = await this.client.zrank(key, userId);

    if (!userRank) {
      throw new Error('User not found');
    }

    let usersToReturn: { user_id: string; money: number; country?: string }[] = [];

    if (userRank < 100) {
      const first100UsersWithScores = await this.client.zrevrange(key, 0, 99, 'WITHSCORES');
      usersToReturn = await this.formatUsersWithScores(first100UsersWithScores);
    } else {
      const first100UsersWithScores = await this.client.zrevrange(key, 0, 99, 'WITHSCORES');
      const surroundingUsersWithScore = await this.client.zrevrange(
        key,
        userRank - 3,
        userRank + 2,
        'WITHSCORES',
      );
      const first100 = await this.formatUsersWithScores(first100UsersWithScores);
      const surround = await this.formatUsersWithScores(surroundingUsersWithScore);
      usersToReturn = [...first100, ...surround];
    }
    return usersToReturn;
  }
  async formatUsersWithScores(
    usersWithScores: string[],
  ): Promise<{ user_id: string; money: number; country?: string }[]> {
    const users: { user_id: string; money: number; country?: string }[] = [];

    for (let i = 0; i < usersWithScores.length; i += 2) {
      const user_id = usersWithScores[i];
      const money = parseFloat(usersWithScores[i + 1]); // Skor (money) değerini sayıya çevir

      // Kullanıcının country bilgisini Hash'ten al
      const userCountry: any = await this.client.hgetall(`user:${user_id}`);
      users.push({ user_id, money, country: userCountry.country! });
    }
    return users;
  }

  async getUsersGroupedByCountry(): Promise<{
    [country: string]: { user_id: string; money: number }[];
  }> {
    const result: { [country: string]: { user_id: string; money: number }[] } = {};

    // Tüm kullanıcıların user_id'lerini al
    const userKeys = await this.client.smembers('users:list'); // veya lrange, smembers, vs.

    // Kullanıcı detaylarını Hash'ten al
    const userDetails = await this.getUserDetails(userKeys);

    // Kullanıcıları country bilgisine göre grupla
    for (const user of userDetails) {
      if (!result[user.country]) {
        result[user.country] = [];
      }
      result[user.country].push({ user_id: user.user_id, money: user.money });
    }

    // Her bir ülke için kullanıcıları money değerine göre sırala
    for (const country of Object.keys(result)) {
      result[country].sort((a, b) => b.money - a.money); // Büyükten küçüğe sırala
    }

    return result;
  }

  private async getUserDetails(
    userKeys: string[],
  ): Promise<{ user_id: string; money: number; country: string }[]> {
    const users: { user_id: string; money: number; country: string }[] = [];

    for (const userKey of userKeys) {
      const userDetails = await this.client.hgetall(userKey);

      users.push({
        user_id: userKey.replace('user:', ''), // user:<user_id> formatından user_id'yi çıkar
        money: parseFloat(userDetails.money), // money değerini sayıya çevir
        country: userDetails.country,
      });
    }

    return users;
  }
}
