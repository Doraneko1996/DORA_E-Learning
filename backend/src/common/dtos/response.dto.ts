import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';

export interface LoginResponse {
  data: {
    access_token: string;
    user: Omit<User, 'password'>; // Loại bỏ password khỏi user
  };
  message: string;
}

export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Base response DTO cho các trường hợp thành công
export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  meta?: Record<string, any>;

  @ApiProperty({ example: '2023-10-05T15:00:00.000Z' })
  timestamp: string;

  @ApiProperty({
    example: 'Thao tác thành công',
    required: false,
  })
  message?: string;

  constructor(
    data: T,
    statusCode: number,
    meta?: Record<string, any>,
    message?: string,
  ) {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
    if (meta) this.meta = meta;
    this.timestamp = new Date().toISOString();
    this.message = message;
  }
}

// Base response DTO cho phân trang
export class PaginatedResponseDto<T> extends SuccessResponseDto<T[]> {
  @ApiProperty({ type: () => PaginationMeta })
  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta, statusCode: number = 200) {
    super(data, statusCode);
    this.meta = meta;
  }
}

// Response DTO cho trường hợp lỗi
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({
    example: ['userName phải là string'],
    required: false,
  })
  details?: string[];

  @ApiProperty({ example: '2023-10-05T15:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/admin' })
  path: string;

  constructor(statusCode: number, message: string, details?: string[]) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.timestamp = new Date().toISOString();
    if (details) this.details = details;
  }
}

// Response DTO cho các request không có response data
export class EmptyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 204 })
  statusCode: number;

  @ApiProperty({ example: '2023-10-05T15:00:00.000Z' })
  timestamp: string;

  constructor(statusCode: number = 204) {
    this.success = true;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class PaginatedAdminResponseDto extends PaginatedResponseDto<User> {
  @ApiProperty({
    example: 'Danh sách admin',
    description: 'Mô tả thêm cho response admin',
  })
  description: string;

  constructor(data: User[], meta: PaginationMeta) {
    super(data, meta);
    this.description = 'Danh sách quản trị viên hệ thống';
  }
}
