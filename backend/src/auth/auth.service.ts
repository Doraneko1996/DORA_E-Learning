/* eslint-disable prettier/prettier */
import { 
    HttpException, 
    HttpStatus, 
    Injectable, 
    // UnauthorizedException, 
    Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    private async generateToken(payload: { id: number; user_name: string }) {
        // const [access_token, refresh_token] = await Promise.all([
        const [access_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
            }),
            // this.jwtService.signAsync(payload, {
            //     secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            //     expiresIn: this.configService.get<string>('JWT_REFRESH_EXP_IN')
            // })
        ]);

        // return { access_token, refresh_token };
        return { access_token };
    }

    async validateToken(token: string): Promise<any> {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            });

            if (!payload.id) {
                throw new HttpException(
                    'Token không hợp lệ: thiếu ID người dùng',
                    HttpStatus.UNAUTHORIZED
                );
            }

            const user = await this.userRepository.findOne({
                where: { id: payload.id }
            });

            if (!user) {
                throw new HttpException(
                    'Người dùng không tồn tại',
                    HttpStatus.NOT_FOUND
                );
            }

            const { password, ...result } = user;
            return result;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            if (error.name === 'JsonWebTokenError') {
                throw new HttpException(
                    'Token không hợp lệ',
                    HttpStatus.UNAUTHORIZED
                );
            }

            if (error.name === 'TokenExpiredError') {
                throw new HttpException(
                    'Token đã hết hạn',
                    HttpStatus.UNAUTHORIZED
                );
            }

            this.logger.error(
                `Lỗi xác thực token: ${error.message}`,
                error.stack
            );

            throw new HttpException(
                'Lỗi xác thực token',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<any> {
        try {
            const user = await this.userRepository.findOne({
                where: { user_name: loginUserDto.user_name }
            });

            if (!user) {
                throw new HttpException("Tài khoản không tồn tại!", HttpStatus.NOT_FOUND);
            }

            if (user.status === 0) {
                throw new HttpException(
                    "Tài khoản đã bị vô hiệu hóa! Vui lòng liên hệ quản lý chuyên môn để biết thêm chi tiết.",
                    HttpStatus.FORBIDDEN
                );
            }

            const checkPass = await bcrypt.compare(loginUserDto.password, user.password);
            if (!checkPass) {
                throw new HttpException('Mật khẩu không chính xác!', HttpStatus.UNAUTHORIZED);
            }

            delete user.password;

            const payload = { id: user.id, user_name: user.user_name };
            const tokens = await this.generateToken(payload);

            return {
                ...tokens,
                user,
                message: 'Đăng nhập thành công!'
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Đăng nhập thất bại: ${error.message}`,
                error.stack
            );
            throw new HttpException(
                'Đã xảy ra lỗi server trong quá trình đăng nhập. Vui lòng liên hệ quản trị viên.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // async refreshToken(refresh_token: string): Promise<any> {
    //     try {
    //         const verify = await this.jwtService.verifyAsync(refresh_token, {
    //             secret: this.configService.get<string>('JWT_REFRESH_SECRET')
    //         });

    //         const user = await this.userRepository.findOneBy({
    //             user_name: verify.user_name
    //         });

    //         if (!user || user.status === 0) {
    //             throw new UnauthorizedException('Token không hợp lệ');
    //         }

    //         // Tạo token mới với thời hạn dài hơn
    //         const tokens = await this.generateToken({
    //             id: verify.id,
    //             user_name: verify.user_name
    //         });

    //         delete user.password;

    //         return {
    //             ...tokens,
    //             user,
    //             message: 'Làm mới token thành công'
    //         };
    //     } catch (error) {
    //         if (error.name === 'TokenExpiredError') {
    //             throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    //         }
    //         this.logger.error(
    //             `Làm mới token thất bại: ${error.message}`,
    //             error.stack
    //         );
    //         throw new UnauthorizedException('Token không hợp lệ');
    //     }
    // }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
            }

            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!isPasswordValid) {
                throw new HttpException('Mật khẩu hiện tại không chính xác', HttpStatus.UNAUTHORIZED);
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;

            await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Đổi mật khẩu thất bại: ${error.message}`,
                error.stack
            );
            throw new HttpException('Lỗi khi đổi mật khẩu', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
