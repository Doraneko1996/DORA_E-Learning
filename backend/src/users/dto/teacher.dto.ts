import { PartialType } from '@nestjs/swagger';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import {
  BasePersonalInfoDto,
  BaseUpdateStatusDto,
  BaseResetPasswordDto,
  BaseDeleteDto,
  BaseFilterDto,
} from './user.dto';
import {
  EDUCATION_LEVEL_OPTIONS,
  GEMS_EMPLOYEE,
  IC3_CERTIFICATE,
  ICDL_CERTIFICATE,
  INFORMATIC_RELATION,
  NVSP_OPTIONS,
} from '@/options/dtos/option.dto';

/**
 * DTO cho hồ sơ giáo viên
 */
export class TeacherProfileDto {
  @ApiProperty({
    description: 'Trạng thái nhân viên (0: Trường, 1: GEMS)',
    example: 1,
    required: false,
    enum: GEMS_EMPLOYEE,
  })
  @IsOptional()
  @IsEnum(GEMS_EMPLOYEE)
  gemsEmployee?: (typeof GEMS_EMPLOYEE)[number];

  @ApiProperty({
    description: 'Trình độ học vấn',
    example: 2,
    required: false,
    enum: EDUCATION_LEVEL_OPTIONS,
  })
  @IsOptional()
  @IsEnum(EDUCATION_LEVEL_OPTIONS)
  educationLevel?: (typeof EDUCATION_LEVEL_OPTIONS)[number];

  @ApiProperty({
    description: 'Bằng liên quan đến tin học (0: Không, 1: Có)',
    example: 1,
    required: false,
    enum: INFORMATIC_RELATION,
  })
  @IsOptional()
  @IsEnum(INFORMATIC_RELATION)
  informaticRelation?: (typeof INFORMATIC_RELATION)[number];

  @ApiProperty({
    description: 'NVSP (Nghiệp vụ sư phạm)',
    example: 3,
    required: false,
    enum: NVSP_OPTIONS,
  })
  @IsOptional()
  @IsEnum(NVSP_OPTIONS)
  nvsp?: (typeof NVSP_OPTIONS)[number];

  @ApiProperty({
    description: 'Chứng chỉ IC3 (1: Có, 0: Không)',
    example: 1,
    required: false,
    enum: IC3_CERTIFICATE,
  })
  @IsOptional()
  @IsEnum(IC3_CERTIFICATE)
  ic3Certificate?: (typeof IC3_CERTIFICATE)[number];

  @ApiProperty({
    description: 'Chứng chỉ ICDL (1: Có, 0: Không)',
    example: 0,
    required: false,
    enum: ICDL_CERTIFICATE,
  })
  @IsOptional()
  @IsEnum(ICDL_CERTIFICATE)
  icdlCertificate?: (typeof ICDL_CERTIFICATE)[number];
}

/**
 * DTO cho lọc giáo viên
 */
export class FilterTeacherDto extends PartialType(
  PickType(BaseFilterDto, [
    'page',
    'limit',
    'sortBy',
    'order',
    'search',
    'gender',
    'district',
  ] as const),
) {
  @ApiProperty({
    description: 'Lọc theo trạng thái nhân viên (0: Trường, 1: GEMS)',
    example: 1,
    required: false,
    enum: GEMS_EMPLOYEE,
  })
  @IsOptional()
  @IsEnum(GEMS_EMPLOYEE)
  gemsEmployee?: (typeof GEMS_EMPLOYEE)[number];

  @ApiProperty({
    description: 'Lọc theo trình độ học vấn',
    example: 2,
    required: false,
    enum: EDUCATION_LEVEL_OPTIONS,
  })
  @IsOptional()
  @IsEnum(EDUCATION_LEVEL_OPTIONS)
  educationLevel?: (typeof EDUCATION_LEVEL_OPTIONS)[number];

  @ApiProperty({
    description: 'Lọc theo chứng chỉ NVSP',
    example: 3,
    required: false,
    enum: NVSP_OPTIONS,
  })
  @IsOptional()
  @IsEnum(NVSP_OPTIONS)
  nvsp?: (typeof NVSP_OPTIONS)[number];

  @ApiProperty({
    description: 'Lọc theo chứng chỉ IC3 (0: Không, 1: Có)',
    example: 1,
    required: false,
    enum: IC3_CERTIFICATE,
  })
  @IsOptional()
  @IsEnum(IC3_CERTIFICATE)
  ic3Certificate?: (typeof IC3_CERTIFICATE)[number];

  @ApiProperty({
    description: 'Lọc theo chứng chỉ ICDL (0: Không, 1: Có)',
    example: 0,
    required: false,
    enum: ICDL_CERTIFICATE,
  })
  @IsOptional()
  @IsEnum(ICDL_CERTIFICATE)
  icdlCertificate?: (typeof ICDL_CERTIFICATE)[number];
}

/**
 * DTO tạo mới giáo viên
 */
export class CreateTeacherDto extends BasePersonalInfoDto {
  @ApiProperty({
    description: 'Hồ sơ giáo viên',
    type: TeacherProfileDto,
    required: false,
  })
  @IsOptional()
  teacherProfile?: TeacherProfileDto;

  //   @ApiProperty({
  //     description: 'Danh sách ID các lớp học mà giáo viên dạy',
  //     example: [1, 2, 3],
  //     required: false,
  //   })
  //   @IsOptional()
  //   @IsArray()
  //   @IsInt({ each: true })
  //   classIds?: number[];
}

/**
 * DTO cập nhật giáo viên
 */
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}

/**
 * DTO cập nhật trạng thái nhiều giáo viên
 */
export class UpdateStatusTeacherDto extends BaseUpdateStatusDto {}

/**
 * DTO đặt lại mật khẩu nhiều giáo viên
 */
export class ResetPasswordTeacherDto extends BaseResetPasswordDto {}

/**
 * DTO xóa nhiều giáo viên
 */
export class DeleteTeacherDto extends BaseDeleteDto {}
