import { Controller, Get, InternalServerErrorException, Param, ParseEnumPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { UseInterceptors } from '@nestjs/common'
import {
    GENDER_OPTIONS,
    PROVINCE_OPTIONS,
    DISTRICT_OPTIONS,
} from './dtos/option.dto';
import {
    genderLabelMap,
    provinceLabelMap,
    districtLabelMap,
} from './constants/label-maps';
import { Public } from '@/auth/decorators/public.decorator';

enum OptionType {
    GENDER = 'gender',
    PROVINCE = 'province',
    DISTRICT = 'district',
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
        description: 'Tùy chọn không hợp lệ'
    })
    @ApiResponse({
        status: 500,
        description: 'Lỗi server'
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
                default:
                    return { data: [] };
            }
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi tải các tùy chọn')
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
