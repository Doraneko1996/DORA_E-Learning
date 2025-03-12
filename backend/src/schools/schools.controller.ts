import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/roles/roles.enum';
import { CreateSchoolDto } from './dto/create-school.dto';
import { FilterSchoolDto } from './dto/filter-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { DeleteSchoolsDto } from './dto/delete-school.dto';

@ApiTags('Quản lý trường học')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post('add')
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo mới trường học' })
  @ApiBody({ type: CreateSchoolDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trường học đã được tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Trường học đã tồn tại',
  })
  async create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Post('list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách trường học' })
  @ApiBody({ type: FilterSchoolDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách trường học'
  })
  async findAll(@Body() filterSchoolDto: FilterSchoolDto) {
    return this.schoolsService.findAll(filterSchoolDto);
  }

  @Get(':id')
  @Roles(UserRole.Admin)
  @Roles(UserRole.Manager)
  @Roles(UserRole.Teacher)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'ID trường học' })
  @ApiOperation({ summary: 'Lấy thông tin chi tiết trường học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết trường học',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy trường học',
  })
  async findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @Roles(UserRole.Manager)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'ID trường học' })
  @ApiOperation({ summary: 'Cập nhật thông tin trường học' })
  @ApiBody({ type: UpdateSchoolDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy trường học',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolsService.update(+id, updateSchoolDto);
  }

  @Delete()
  @Roles(UserRole.Admin)
  @Roles(UserRole.Manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa nhiều trường học' })
  @ApiBody({ type: DeleteSchoolsDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy trường học để xóa',
  })
  async remove(@Body() deleteSchoolsDto: DeleteSchoolsDto): Promise<void> {
    await this.schoolsService.remove(deleteSchoolsDto);
  }
}