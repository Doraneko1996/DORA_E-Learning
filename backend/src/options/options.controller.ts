import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';
import {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  DISTRICT_OPTIONS,
  GEMS_EMPLOYEE,
  EDUCATION_LEVEL_OPTIONS,
  INFORMATIC_RELATION,
  NVSP_OPTIONS,
  IC3_CERTIFICATE,
  ICDL_CERTIFICATE,
} from './dtos/option.dto';
import {
  genderLabelMap,
  provinceLabelMap,
  districtLabelMap,
  gemsEmployeeLabelMap,
  educationLevelLabelMap,
  informaticRelation,
  nvspLabelMap,
  ic3CertificateLabelMap,
  icdlCertificateLabelMap,
} from './constants/label-maps';
import { Public } from '@/auth/decorators/public.decorator';

enum OptionType {
  GENDER = 'gender',
  PROVINCE = 'province',
  DISTRICT = 'district',
  GEMS_EMPLOYEE = 'gems_employee',
  EDUCATION_LEVEL = 'education_level',
  INFORMATIC_RELATION = 'informatic_relation',
  NVSP = 'nvsp',
  IC3_CERTIFICATE = 'ic3_certificate',
  ICDL_CERTIFICATE = 'icdl_certificate',
}

@ApiTags('Các tùy chọn lọc')
@Controller('options')
@UseInterceptors(CacheInterceptor)
@CacheTTL(3600 * 24 * 7)
export class OptionsController {
  @Get(':type')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách các tùy chọn' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách các tùy chọn',
    schema: {
      example: {
        data: [
          { value: 'HCM', label: 'TP.Hồ Chí Minh' },
          { value: 'LA', label: 'Long An' },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tùy chọn không hợp lệ',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi server',
  })
  async getOptions(
    @Param('type', new ParseEnumPipe(OptionType)) type: OptionType,
  ) {
    try {
      switch (type) {
        case OptionType.GENDER:
          return this.formatOptions(GENDER_OPTIONS, genderLabelMap);
        case OptionType.PROVINCE:
          return this.formatOptions(PROVINCE_OPTIONS, provinceLabelMap);
        case OptionType.DISTRICT:
          return this.formatOptions(DISTRICT_OPTIONS, districtLabelMap);
        case OptionType.GEMS_EMPLOYEE:
          return this.formatOptions(GEMS_EMPLOYEE, gemsEmployeeLabelMap);
        case OptionType.EDUCATION_LEVEL:
          return this.formatOptions(
            EDUCATION_LEVEL_OPTIONS,
            educationLevelLabelMap,
          );
        case OptionType.INFORMATIC_RELATION:
          return this.formatOptions(INFORMATIC_RELATION, informaticRelation);
        case OptionType.NVSP:
          return this.formatOptions(NVSP_OPTIONS, nvspLabelMap);
        case OptionType.IC3_CERTIFICATE:
          return this.formatOptions(IC3_CERTIFICATE, ic3CertificateLabelMap);
        case OptionType.ICDL_CERTIFICATE:
          return this.formatOptions(ICDL_CERTIFICATE, icdlCertificateLabelMap);
        default:
          return { data: [] };
      }
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tải các tùy chọn');
    }
  }

  private formatOptions(
    values: readonly string[],
    labelMap: Record<string, string>,
  ) {
    return {
      data: values.map((value) => ({
        value,
        label: labelMap[value] || value,
      })),
    };
  }
}
