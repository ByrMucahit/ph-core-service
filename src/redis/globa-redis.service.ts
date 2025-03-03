// redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './global-redis.provider';

@Injectable()
export class GlobalRedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }
  async publish(channel: string, message: string): Promise<void> {
    const redisClient = this.getClient();
    await redisClient.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const redisClient = this.getClient();
    await redisClient.subscribe(channel, (err, count) => {
      if (err) {
        console.error('Failed to subscribe:', err);
        return;
      }
      console.log(`Subscribed to ${count} channels.`);
    });

    redisClient.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }
}
