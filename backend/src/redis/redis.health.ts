import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisHealthIndicator {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const ping = await this.redis.ping();
      return {
        redis: {
          status: ping === 'PONG' ? 'up' : 'down',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }
}
