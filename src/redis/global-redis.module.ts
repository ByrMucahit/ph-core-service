// redis.module.ts
import { Module } from '@nestjs/common';
import { redisProvider } from './global-redis.provider';
import { GlobalRedisService } from './globa-redis.service';

@Module({
  providers: [redisProvider, GlobalRedisService],
  exports: [GlobalRedisService],
})
export class GlobalRedisModule {}
