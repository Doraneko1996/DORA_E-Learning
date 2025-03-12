import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { LoginResponse } from '@/common/dtos/response.dto';

// Định nghĩa interface cho payload của JWT
interface JwtPayload {
  id: number;
  userName: string;
  role: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Tạo JWT token dựa trên payload
   * @param payload - Thông tin người dùng để mã hóa trong token
   * @returns Object chứa access_token
   */
  private async generateToken(
    payload: JwtPayload,
  ): Promise<{ access_token: string }> {
    try {
      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      });
      return { access_token };
    } catch (error) {
      this.logger.error(`Tạo token thất bại: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi server khi tạo token');
    }
  }

  /**
   * Xử lý đăng nhập người dùng
   * @param loginUserDto - DTO chứa thông tin đăng nhập
   * @returns Thông tin token và user (không chứa password)
   */
  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { userName: loginUserDto.userName },
        select: [
          'id',
          'role',
          'userName',
          'firstName',
          'lastName',
          'password',
          'status',
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      if (!user.status) {
        throw new ForbiddenException('Tài khoản đã bị khóa');
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      const token = await this.generateToken({
        id: user.id,
        userName: user.userName,
        role: user.role,
      });

      // Loại bỏ password khỏi user trước khi trả về
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return {
        data: {
          access_token: token.access_token,
          user: userWithoutPassword,
        },
        message: 'Đăng nhập thành công',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      // Ghi log lỗi nghiêm trọng (ví dụ: lỗi database, lỗi server)
      this.logger.error(
        `Lỗi khi đăng nhập cho ${loginUserDto.userName}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi đăng nhập');
    }
  }

  /**
   * Đổi mật khẩu người dùng
   * @param userId - ID của người dùng
   * @param currentPassword - Mật khẩu hiện tại
   * @param newPassword - Mật khẩu mới
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'password'], // Chỉ lấy các trường cần thiết
      });

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.update(userId, { password: hashedNewPassword });
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Ghi log lỗi nghiêm trọng (ví dụ: lỗi database, lỗi bcrypt)
      this.logger.error(
        `Lỗi khi đổi mật khẩu cho userId ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi đổi mật khẩu');
    }
  }

  // Để sẵn sàng cho việc thêm refresh token sau này
  /*
  async refreshToken(refresh_token: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { userName: verify.userName },
        select: ['id', 'userName', 'role', 'status'],
      });

      if (!user || !user.status) {
        throw new UnauthorizedException('Token không hợp lệ hoặc tài khoản bị khóa');
      }

      const tokens = await this.generateToken({
        id: user.id,
        userName: user.userName,
        role: user.role,
      });

      return {
        data: {
          access_token: tokens.access_token,
          user,
        },
        message: 'Làm mới token thành công',
      };
    } catch (error) {
      this.logger.error(`Làm mới token thất bại: ${error.message}`, error.stack);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
      }
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
  */
}
