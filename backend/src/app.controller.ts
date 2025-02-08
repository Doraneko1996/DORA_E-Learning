import { Controller, Get, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from './common/guards/throttler.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-throttle')
  @UseGuards(RateLimitGuard)
  testThrottle() {
    return 'Testing throttle';
  }
}
