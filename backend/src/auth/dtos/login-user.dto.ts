import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    userName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}