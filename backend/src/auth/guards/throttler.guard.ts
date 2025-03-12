import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected errorMessage = 'Quá nhiều yêu cầu, vui lòng thử lại sau.';
}