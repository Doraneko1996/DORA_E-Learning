import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { SchoolBaseDto } from './base-school.dto';
import { 
    IsOptional, 
    IsDateString, 
    IsPositive 
} from 'class-validator';

export class UpdateSchoolDto extends PartialType(
    PickType(SchoolBaseDto, [
        'name', 
        'educationLevel', 
        'address', 
        'district', 
        'province'
    ] as const)
) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPositive()
    academicManagerId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPositive()
    technicalManagerId?: number;
}