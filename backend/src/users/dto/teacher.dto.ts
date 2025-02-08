import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateTeacherDto {
    @IsString()
    user_name: string;

    @IsString()
    password: string;

    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsDate()
    dob: Date;

    @IsOptional()
    @IsNumber()
    gender?: number;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsBoolean()
    gems_employee?: boolean;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsNumber()
    education_level?: number;

    @IsOptional()
    @IsBoolean()
    informatic_relation?: boolean;

    @IsOptional()
    @IsNumber()
    nvsp?: number;

    @IsOptional()
    @IsBoolean()
    ic3_certificate?: boolean;

    @IsOptional()
    @IsBoolean()
    icdl_certificate?: boolean;

    @IsOptional()
    @IsNumber()
    status?: number;
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}

