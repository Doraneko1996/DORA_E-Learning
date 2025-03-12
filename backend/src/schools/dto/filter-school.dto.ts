import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
    IsOptional, 
    IsInt, 
    Min, 
    Max, 
    IsString, 
    IsEnum, 
    MaxLength
} from 'class-validator';
import { 
    PROVINCE_OPTIONS, 
    DISTRICT_OPTIONS, 
    SORT_ORDER 
} from '@/options/dtos/option.dto';

export class FilterSchoolDto {
    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ minimum: 50, maximum: 500, default: 50 })
    @Type(() => Number)
    @IsInt()
    @Min(10)
    @Max(100)
    limit: number = 50;

    @ApiPropertyOptional({ enum: ['name', 'educationLevel', 'createdAt'] })
    @IsOptional()
    @IsString()
    @IsEnum(['name', 'educationLevel', 'createdAt'])
    sortBy?: string;

    @ApiPropertyOptional({ enum: SORT_ORDER })
    @IsOptional()
    @IsEnum(SORT_ORDER)
    order?: typeof SORT_ORDER[number];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @ApiPropertyOptional({ enum: [1, 2] })
    @IsOptional()
    @IsInt()
    @IsEnum([1, 2])
    educationLevel?: number;

    @ApiPropertyOptional({ enum: PROVINCE_OPTIONS })
    @IsOptional()
    @IsEnum(PROVINCE_OPTIONS)
    province?: typeof PROVINCE_OPTIONS[number];

    @ApiPropertyOptional({ enum: DISTRICT_OPTIONS })
    @IsOptional()
    @IsEnum(DISTRICT_OPTIONS)
    district?: typeof DISTRICT_OPTIONS[number];
}