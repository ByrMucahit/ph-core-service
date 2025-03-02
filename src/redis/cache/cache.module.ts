import { Module } from '@nestjs/common';

import { CacheService } from './cache.service';
import { GlobalRedisModule } from '../global-redis.module';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({
  imports: [GlobalRedisModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
