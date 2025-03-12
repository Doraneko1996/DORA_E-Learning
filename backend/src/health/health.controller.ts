import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, HealthCheckResult, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@/redis/redis.health';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('Health Check')
@Public()
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly dbHealthIndicator: TypeOrmHealthIndicator,
        private readonly redisHealthIndicator: RedisHealthIndicator
    ) {}

    @Get()
    @HealthCheck()
    async checkHealth(): Promise<HealthCheckResult> {
        return this.health.check([
            async () => this.dbHealthIndicator.pingCheck('database'),
            async () => this.redisHealthIndicator.isHealthy(),
        ]);
    }
}
