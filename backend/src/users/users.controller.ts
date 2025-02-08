import { Controller, Post, Body, Get, Param, Patch, HttpException, HttpStatus, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateAdminDto, DeleteAdminsDto, FilterAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { UpdateUserProfileDto, UpdateUserStatusDto } from './dto/user.dto';
import { UserRole } from 'src/auth/roles/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from './entities/user.entity';

@ApiTags('Quản lý người dùng')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng được trả về.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async getCurrentUser(@Req() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async updateProfile(
    @Req() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    return this.usersService.updateProfile(req.user.id, updateUserProfileDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng được trả về.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Cập nhật trạng thái người dùng' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của người dùng' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({ status: 200, description: 'Trạng thái người dùng được cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi cập nhật trạng thái.' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateUserStatusDto
  ) {
    return this.usersService.updateStatus(id, updateStatusDto.status);
  }
}

@ApiTags('Quản lý admin')
@Controller('admin')
export class AdminsController {
  constructor(private readonly usersService: UsersService) { }

  @Post('list')
  @Public()
  // @Roles(UserRole.Admin)
  // @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách admin' })
  @ApiBody({ type: FilterAdminDto })
  @ApiResponse({ status: 200, description: 'Danh sách admin được trả về.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  findAll(@Body() filterAdminDto: FilterAdminDto) {
    return this.usersService.findAllAdmin(filterAdminDto);
  }

  @Post('add')
  @Public()
  // @Roles(UserRole.Admin)
  // @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Thêm mới admin' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin đã được tạo thành công.' })
  @ApiResponse({ status: 409, description: 'Tên người dùng đã tồn tại.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi thêm admin.' })
  async addAdmin(@Body() createAdminDto: CreateAdminDto): Promise<{ user: User, message: string }> {
    try {
      return await this.usersService.addAdmin(createAdminDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi thêm admin',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @Public()
  // @Roles(UserRole.Admin)
  // @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin admin' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của admin' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({ status: 200, description: 'Thông tin admin được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi cập nhật admin.' })
  async updateAdmin(@Param('id') id: number, @Body() updateAdminDto: UpdateAdminDto): Promise<{ user: User, message: string }> {
    try {
      return await this.usersService.updateAdmin(id, updateAdminDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật admin',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete()
  @Public()
  // @Roles(UserRole.Admin)
  // @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xóa admin' })
  @ApiBody({ type: DeleteAdminsDto })
  @ApiResponse({ status: 200, description: 'Admin đã được xóa thành công.' })
  @ApiResponse({ status: 403, description: 'Không thể tự xóa chính mình.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin để xóa.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi xóa admin.' })
  async removeAdmin(@Body() deleteAdminsDto: DeleteAdminsDto, @Req() req): Promise<{ message: string }> {
    try {
      const currentUserId = req.user.id;
      const result = await this.usersService.removeAdmin(deleteAdminsDto.ids, currentUserId);
      return { message: result.message };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xóa admin',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}