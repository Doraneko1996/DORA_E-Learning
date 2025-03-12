import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  DISTRICT_OPTIONS,
  SORT_ORDER,
} from '@/options/dtos/option.dto';

/**
 * Base DTO chứa các trường dùng chung cho nhiều DTO
 */
export class UserBaseDto {
  @ApiProperty({
    description: 'Tên người dùng',
    example: 'admin123',
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userName: string;

  @ApiProperty({
    description: 'Họ và chữ đệm',
    example: 'Nguyễn Thanh',
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Tên',
    example: 'Hùng',
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;
}

/**
 * DTO cơ sở cho các thuộc tính lọc (filter)
 */
export class BaseFilterDto {
  @ApiProperty({
    description: 'Trang hiện tại',
    minimum: 1,
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(500)
  limit?: number = 50;

  @ApiProperty({
    description: 'Sắp xếp theo',
    example: 'firstName',
    required: false,
    enum: [
      'userName',
      'lastName',
      'status',
      'gender',
      'dob',
      'district',
      'province',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    'userName',
    'lastName',
    'status',
    'gender',
    'dob',
    'district',
    'province',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string;

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    example: 'ASC',
    required: false,
    enum: SORT_ORDER,
  })
  @IsOptional()
  @IsEnum(SORT_ORDER)
  order?: (typeof SORT_ORDER)[number];

  @ApiProperty({
    description: 'Tìm kiếm bằng từ khóa',
    example: 'Định',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiProperty({
    description: 'Giới tính',
    example: '1',
    required: false,
    enum: GENDER_OPTIONS,
  })
  @IsOptional()
  @IsEnum(GENDER_OPTIONS)
  gender?: (typeof GENDER_OPTIONS)[number];

  @ApiProperty({
    description: 'Quận/Huyện',
    example: 'BTHANH',
    required: false,
    enum: DISTRICT_OPTIONS,
  })
  @IsOptional()
  @IsEnum(DISTRICT_OPTIONS)
  district?: (typeof DISTRICT_OPTIONS)[number];

  @ApiProperty({
    description: 'Thành phố/Tỉnh',
    example: 'HCM',
    required: false,
    enum: PROVINCE_OPTIONS,
  })
  @IsOptional()
  @IsEnum(PROVINCE_OPTIONS)
  province?: (typeof PROVINCE_OPTIONS)[number];
}

/**
 * DTO cơ sở cho thông tin cá nhân
 */
export class BasePersonalInfoDto extends UserBaseDto {
  @ApiProperty({
    description: 'Giới tính',
    example: '0',
    required: false,
    enum: GENDER_OPTIONS,
  })
  @IsOptional()
  @IsEnum(GENDER_OPTIONS)
  gender?: (typeof GENDER_OPTIONS)[number];

  @ApiProperty({
    description: 'Ngày sinh',
    example: '1996-01-05',
    required: false,
  })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Email',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường ABC',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({
    description: 'Quận/Huyện',
    example: 'BTHANH',
    required: false,
    enum: DISTRICT_OPTIONS,
  })
  @IsOptional()
  @IsEnum(DISTRICT_OPTIONS)
  district?: (typeof DISTRICT_OPTIONS)[number];

  @ApiProperty({
    description: 'Thành phố/Tỉnh',
    example: 'HCM',
    required: false,
    enum: PROVINCE_OPTIONS,
  })
  @IsOptional()
  @IsEnum(PROVINCE_OPTIONS)
  province?: (typeof PROVINCE_OPTIONS)[number];
}

/**
 * DTO cơ sở cho cập nhật trạng thái
 */
export class BaseUpdateStatusDto {
  @ApiProperty({
    description: 'Danh sách ID cần cập nhật trạng thái',
    example: [1, 2, 3],
    required: true,
  })
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({
    description: 'Trạng thái',
    example: 1,
    required: true,
    enum: [0, 1],
  })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

/**
 * DTO cơ sở cho đặt lại mật khẩu
 */
export class BaseResetPasswordDto {
  @ApiProperty({
    description: 'Danh sách ID cần đặt lại mật khẩu',
    example: [1, 2, 3],
    required: true,
  })
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}

/**
 * DTO cơ sở cho xóa
 */
export class BaseDeleteDto {
  @ApiProperty({
    description: 'Danh sách ID cần xóa',
    example: [1, 2, 3],
    required: true,
  })
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
