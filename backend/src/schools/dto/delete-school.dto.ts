import { ApiProperty } from '@nestjs/swagger';
import { 
    ArrayNotEmpty, 
    IsInt 
} from 'class-validator';

export class DeleteSchoolsDto {
    @ApiProperty({ example: [1, 2, 3] })
    @ArrayNotEmpty()
    @IsInt({ each: true })
    ids: number[];
}