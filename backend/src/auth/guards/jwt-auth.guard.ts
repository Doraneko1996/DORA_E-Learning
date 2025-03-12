import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Redis } from 'ioredis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '@/redis/redis.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    // Kiểm tra blacklist token
    const isRevoked = await this.redisClient.exists(`blacklist:${token}`);
    if (isRevoked) {
      throw new UnauthorizedException('Token đã bị thu hồi');
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private extractToken(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }
}
