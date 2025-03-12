import { ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolBaseDto } from './base-school.dto';
import { IsDateString, IsOptional, IsPositive } from 'class-validator';

export class CreateSchoolDto extends SchoolBaseDto {
    @ApiPropertyOptional({ type: Date })
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