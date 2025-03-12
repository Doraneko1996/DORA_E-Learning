import { ApiProperty } from '@nestjs/swagger';
import { 
    IsString, 
    IsIn,
    MaxLength,
    IsEnum
} from 'class-validator';
import { 
    PROVINCE_OPTIONS, 
    DISTRICT_OPTIONS 
} from '@/options/dtos/option.dto';

export class SchoolBaseDto {
    @ApiProperty({ example: 'Trường THCS Chu Văn An', maxLength: 255 })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ enum: [1, 2], description: '1: Tiểu học, 2: THCS' })
    @IsIn([1, 2], { message: 'Cấp học không hợp lệ' })
    educationLevel: number;

    @ApiProperty({ maxLength: 255 })
    @IsString()
    @MaxLength(255)
    address: string;

    @ApiProperty({ enum: DISTRICT_OPTIONS })
    @IsString()
    @IsEnum(DISTRICT_OPTIONS)
    district: typeof DISTRICT_OPTIONS[number];

    @ApiProperty({ enum: PROVINCE_OPTIONS })
    @IsString()
    @IsEnum(PROVINCE_OPTIONS)
    province: typeof PROVINCE_OPTIONS[number];
}