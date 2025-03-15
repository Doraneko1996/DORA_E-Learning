import { Module, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisHealthIndicator } from './redis.health';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });

        // Xử lý lỗi kết nối
        redis.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return redis;
      },
      inject: [ConfigService],
    },
    RedisHealthIndicator,
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisHealthIndicator, RedisService], // Export để dùng ở nơi khác
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}
  async onModuleInit() {}

  async onModuleDestroy() {
    await this.redisClient.quit(); // Đóng kết nối khi module bị hủy
  }
}
