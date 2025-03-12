import {
  Body,
  Controller,
  Post,
  Req,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { SuccessResponseDto } from '@/common/dtos/response.dto';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@/redis/redis.constants';

@ApiTags('Authenticator')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: SuccessResponseDto,
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // @Post('refresh-token')
  // @ApiOperation({ summary: 'Làm mới access token' })
  // @ApiHeader({
  //     name: 'Authorization',
  //     description: 'Bearer refresh_token'
  // })
  // async refreshToken(@Headers('authorization') authHeader: string) {
  //     try {
  //         if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //             throw new UnauthorizedException('Refresh token không tồn tại');
  //         }

  //         const refreshToken = authHeader.split(' ')[1];
  //         const result = await this.authService.refreshToken(refreshToken);

  //         return {
  //             access_token: result.access_token,
  //             refresh_token: result.refresh_token,
  //             user: result.user,
  //             message: result.message
  //         };
  //     } catch (error) {
  //         throw new UnauthorizedException(error.message);
  //     }
  // }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
  @ApiOkResponse({ description: 'Đăng xuất thành công!' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server!' })
  async logout(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = this.jwtService.decode(token) as { exp: number };

    // Tính toán TTL còn lại (đơn vị: giây)
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      await this.redisClient.set(`blacklist:${token}`, 'revoked', 'EX', ttl);
    }

    return { message: 'Đăng xuất thành công' };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const userId = req.user.id;
      await this.authService.changePassword(
        userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      return {
        success: true,
        message: 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi đổi mật khẩu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
