import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  first_name?: string;

  @ApiProperty({ required: false })
  last_name?: string;

  @ApiProperty({ required: false, enum: [0, 1, 2] })
  gender?: number;

  @ApiProperty({ required: false })
  dob?: Date;

  @ApiProperty({ required: false })
  phone_number?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  district?: string;

  @ApiProperty({ required: false })
  province?: string;

  // Các trường dành riêng cho giáo viên
  @ApiProperty({ required: false })
  education_level?: number;

  @ApiProperty({ required: false })
  informatic_relation?: boolean;

  @ApiProperty({ required: false })
  nvsp?: number;

  @ApiProperty({ required: false })
  ic3_certificate?: boolean;

  @ApiProperty({ required: false })
  icdl_certificate?: boolean;
}