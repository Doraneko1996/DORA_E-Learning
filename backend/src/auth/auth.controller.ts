/* eslint-disable prettier/prettier */
import {
    // Headers,
    Body,
    Controller,
    Post,
    ValidationPipe,
    UsePipes,
    Req,
    // UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiTags,
    ApiOkResponse,
    ApiInternalServerErrorResponse,
    // ApiHeader,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Authenticator')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @Public()
    @ApiOperation({ summary: 'Đăng nhập hệ thống' })
    @ApiBody({ type: LoginUserDto })
    @UsePipes(ValidationPipe)
    async login(@Body() loginUserDto: LoginUserDto) {
        const { access_token, refresh_token, user, message } = await this.authService.login(loginUserDto);

        return {
            access_token,
            refresh_token,
            user,
            message
        };
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
    @Public()
    @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
    @ApiOkResponse({ description: 'Đăng xuất thành công!' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi server!' })
    async logout() {
        return { message: 'Đăng xuất thành công.' };
    }

    @Post('change-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(
        @Req() req: any,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        try {
            const userId = req.user.id;
            await this.authService.changePassword(
                userId,
                changePasswordDto.currentPassword,
                changePasswordDto.newPassword
            );

            return {
                success: true,
                message: 'Đổi mật khẩu thành công'
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Lỗi khi đổi mật khẩu',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
