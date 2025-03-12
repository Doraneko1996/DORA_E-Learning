import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Mật khẩu hiện tại',
        example: 'current123'
    })
    @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    currentPassword: string;

    @ApiProperty({
        description: 'Mật khẩu mới',
        example: 'new123'
    })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
} 