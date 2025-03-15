import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  HttpException,
  HttpStatus,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateAdminDto,
  DeleteAdminDto,
  FilterAdminDto,
  ResetPasswordAdminDto,
  UpdateAdminDto,
  UpdateStatusAdminDto,
} from './dto/admin.dto';
import {
  CreateManagerDto,
  DeleteManagerDto,
  FilterManagerDto,
  ResetPasswordManagerDto,
  UpdateManagerDto,
  UpdateStatusManagerDto,
} from './dto/manager.dto';
import {
  CreateTeacherDto,
  DeleteTeacherDto,
  FilterTeacherDto,
  ResetPasswordTeacherDto,
  UpdateStatusTeacherDto,
  UpdateTeacherDto,
} from './dto/teacher.dto';
// import { UpdateUserProfileDto } from './dto/user.dto';
import { Response } from 'express';
import { UserRole } from 'src/auth/roles/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs/promises';

@ApiTags('Quản lý người dùng')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin người dùng được trả về.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async getCurrentUser(@Req() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  // @Patch('me')
  // @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  // @ApiBody({ type: UpdateUserProfileDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Thông tin người dùng đã được cập nhật.',
  // })
  // @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  // async updateProfile(
  //   @Req() req,
  //   @Body() updateUserProfileDto: UpdateUserProfileDto,
  // ) {
  //   return this.usersService.updateProfile(req.user.id, updateUserProfileDto);
  // }
}

@ApiTags('Quản lý admin')
@ApiBearerAuth()
@Roles(UserRole.Admin)
@Controller('admins')
export class AdminsController {
  constructor(private readonly usersService: UsersService) {}

  //#####===== LẤY DANH SÁCH ADMIN =====#####//
  @Post('list')
  @ApiOperation({ summary: 'Lấy danh sách admin' })
  @ApiBody({ type: FilterAdminDto })
  @ApiResponse({ status: 200, description: 'Danh sách admin được trả về.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async getAdmins(@Body() filterAdminDto: FilterAdminDto) {
    return this.usersService.findAllAdmin(filterAdminDto);
  }

  //#####===== THÊM MỚI ADMIN =====#####//
  @Post('add')
  @ApiOperation({ summary: 'Thêm mới admin' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin đã được tạo thành công.' })
  @ApiResponse({ status: 409, description: 'Tên người dùng đã tồn tại.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi thêm admin.' })
  async addAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.addAdmin(createAdminDto);
  }

  //#####===== CẬP NHẬT THÔNG TIN ADMIN =====#####//
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin admin' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của admin' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Thông tin admin được cập nhật thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi cập nhật admin.' })
  async updateAdmin(
    @Param('id') id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<{ user: User; message: string }> {
    try {
      return await this.usersService.updateAdmin(id, updateAdminDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật admin',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //#####===== XÓA ADMIN =====#####//
  @Delete()
  @ApiOperation({ summary: 'Xóa admin' })
  @ApiBody({ type: DeleteAdminDto })
  @ApiResponse({ status: 200, description: 'Admin đã được xóa thành công.' })
  @ApiResponse({ status: 403, description: 'Không thể tự xóa chính mình.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin để xóa.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi xóa admin.' })
  async removeAdmin(
    @Body() deleteAdminsDto: DeleteAdminDto,
    @Req() req: Request & { user?: { id: number } },
  ) {
    const currentUserId = req.user?.id;
    return this.usersService.removeAdmin(deleteAdminsDto.ids, currentUserId);
  }

  //#####===== CẬP NHẬT TRẠNG THÁI ADMIN =====#####//
  @Post('status')
  @ApiOperation({ summary: 'Cập nhật trạng thái admin' })
  @ApiBody({ type: UpdateStatusAdminDto })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 500, description: 'Lỗi khi xóa admin.' })
  async updateAdminStatus(
    @Body() updateStatusAdminDto: UpdateStatusAdminDto,
    @Req() req: Request & { user?: { id: number } },
  ) {
    const currentUserId = req.user?.id;
    return this.usersService.updateAdminStatus(
      updateStatusAdminDto.ids,
      updateStatusAdminDto.status,
      currentUserId,
    );
  }

  //#####===== ĐẶT LẠI MẬT KHẨU ADMIN =====#####//
  @Post('reset-pw')
  @Roles(UserRole.Admin) // Chỉ Super Admin (kiểm tra trong service)
  @ApiOperation({ summary: 'Đặt lại mật khẩu Admin về mặc định' })
  @ApiBody({ type: ResetPasswordAdminDto })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công.' })
  @ApiResponse({ status: 403, description: 'Chỉ Super Admin mới có quyền.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Admin.' })
  @ApiResponse({ status: 400, description: 'Không thể reset Super Admin.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi đặt lại mật khẩu Admin.' })
  async resetAdminPassword(
    @Body() resetPasswordAdminDto: ResetPasswordAdminDto,
    @Req() req: Request & { user?: { id: number } },
  ) {
    const currentUserId = req.user?.id;
    return this.usersService.resetAdminPassword(
      resetPasswordAdminDto,
      currentUserId,
    );
  }
}

@ApiTags('Quản lý manager')
@ApiBearerAuth()
@Controller('managers')
export class ManagersController {
  constructor(private readonly usersService: UsersService) {}

  //#####===== LẤY DANH SÁCH MANAGER =====#####//
  @Post('list')
  @Roles(UserRole.Manager, UserRole.Admin)
  @ApiOperation({ summary: 'Lấy danh sách manager' })
  @ApiBody({ type: FilterManagerDto })
  @ApiResponse({ status: 200, description: 'Danh sách manager được trả về.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async getManagers(@Body() filterManagerDto: FilterManagerDto) {
    return this.usersService.findAllManager(filterManagerDto);
  }

  //#####===== THÊM MỚI MANAGER =====#####//
  @Post('add')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Thêm mới manager' })
  @ApiBody({ type: CreateManagerDto })
  @ApiResponse({ status: 201, description: 'Manager đã được tạo thành công.' })
  @ApiResponse({ status: 409, description: 'Tên người dùng đã tồn tại.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi thêm manager.' })
  async addManager(@Body() createManagerDto: CreateManagerDto) {
    return this.usersService.addManager(createManagerDto);
  }

  //#####===== CẬP NHẬT THÔNG TIN MANAGER =====#####//
  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Cập nhật thông tin manager' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của manager' })
  @ApiBody({ type: UpdateManagerDto })
  @ApiResponse({
    status: 200,
    description: 'Thông tin manager được cập nhật thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy manager.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi cập nhật manager.' })
  async updateManager(
    @Param('id') id: number,
    @Body() updateManagerDto: UpdateManagerDto,
  ): Promise<{ user: User; message: string }> {
    try {
      return await this.usersService.updateManager(id, updateManagerDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật manager',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //#####===== XÓA MANAGER =====#####//
  @Delete()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Xóa manager' })
  @ApiBody({ type: DeleteManagerDto })
  @ApiResponse({ status: 200, description: 'Manager đã được xóa thành công.' })
  @ApiResponse({ status: 403, description: 'Không thể tự xóa chính mình.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy manager để xóa.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi xóa manager.' })
  async removeManager(@Body() deleteManagersDto: DeleteManagerDto) {
    return await this.usersService.removeManager(deleteManagersDto.ids);
  }

  //#####===== CẬP NHẬT TRẠNG THÁI MANAGER =====#####//
  @Post('status')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Cập nhật trạng thái manager' })
  @ApiBody({ type: UpdateStatusManagerDto })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({
    status: 500,
    description: 'Lỗi khi cập nhật trạng thái manager.',
  })
  async updateManagerStatus(
    @Body() updateStatusManagerDto: UpdateStatusManagerDto,
  ) {
    return await this.usersService.updateManagerStatus(
      updateStatusManagerDto.ids,
      updateStatusManagerDto.status,
    );
  }

  //#####===== ĐẶT LẠI MẬT KHẨU MANAGER =====#####//
  @Post('reset-pw')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Reset mật khẩu nhiều Manager về mặc định' })
  @ApiBody({ type: ResetPasswordManagerDto })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Manager.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async resetManagerPasswords(
    @Body() resetPasswordManagerDto: ResetPasswordManagerDto,
  ) {
    return this.usersService.resetManagerPassword(resetPasswordManagerDto);
  }
}

@ApiTags('Quản lý giáo viên')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  private readonly logger = new Logger(TeachersController.name);
  constructor(private readonly usersService: UsersService) {}

  //#####===== LẤY DANH SÁCH TEACHER =====#####//
  @Post('list')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Lấy danh sách giáo viên' })
  @ApiBody({ type: FilterTeacherDto })
  @ApiResponse({ status: 200, description: 'Danh sách giáo viên được trả về.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async getTeachers(@Body() filterTeacherDto: FilterTeacherDto) {
    return this.usersService.findAllTeacher(filterTeacherDto);
  }

  //#####===== THÊM MỚI TEACHER =====#####//
  @Post('add')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Thêm mới giáo viên' })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({
    status: 201,
    description: 'Giáo viên đã được tạo thành công.',
  })
  @ApiResponse({ status: 409, description: 'Tên người dùng đã tồn tại.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi thêm giáo viên.' })
  async addTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.usersService.addTeacher(createTeacherDto);
  }

  //#####===== CẬP NHẬT THÔNG TIN TEACHER =====#####//
  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Cập nhật thông tin giáo viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của giáo viên' })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Thông tin giáo viên được cập nhật thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên.' })
  @ApiResponse({
    status: 409,
    description:
      'Dữ liệu cập nhật gây xung đột (username hoặc email đã tồn tại).',
  })
  @ApiResponse({ status: 500, description: 'Lỗi khi cập nhật giáo viên.' })
  async updateTeacher(
    @Param('id') id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<{ user: User; message: string }> {
    try {
      return await this.usersService.updateTeacher(id, updateTeacherDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật giáo viên',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //#####===== XÓA TEACHER =====#####//
  @Delete()
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Xóa giáo viên' })
  @ApiBody({ type: DeleteTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Giáo viên đã được xóa thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên để xóa.' })
  @ApiResponse({ status: 500, description: 'Lỗi khi xóa giáo viên.' })
  async removeTeacher(@Body() deleteTeachersDto: DeleteTeacherDto) {
    return this.usersService.removeTeacher(deleteTeachersDto.ids);
  }

  //#####===== CẬP NHẬT TRẠNG THÁI TEACHER =====#####//
  @Post('status')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Cập nhật trạng thái giáo viên' })
  @ApiBody({ type: UpdateStatusTeacherDto })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên.' })
  @ApiResponse({
    status: 500,
    description: 'Lỗi khi cập nhật trạng thái giáo viên.',
  })
  async updateTeacherStatus(
    @Body() updateStatusTeacherDto: UpdateStatusTeacherDto,
  ) {
    return this.usersService.updateTeacherStatus(
      updateStatusTeacherDto.ids,
      updateStatusTeacherDto.status,
    );
  }

  //#####===== ĐẶT LẠI MẬT KHẨU TEACHER =====#####//
  @Post('reset-pw')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Đặt lại mật khẩu giáo viên về mặc định' })
  @ApiBody({ type: ResetPasswordTeacherDto })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên.' })
  @ApiResponse({
    status: 500,
    description: 'Lỗi khi đặt lại mật khẩu giáo viên.',
  })
  async resetTeacherPassword(
    @Body() resetPasswordTeacherDto: ResetPasswordTeacherDto,
  ) {
    return this.usersService.resetTeacherPassword(resetPasswordTeacherDto);
  }

  //#####===== IMPORT TEACHER TỪ EXCEL =====#####//
  @Post('import')
  @Roles(UserRole.Admin, UserRole.Manager)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import giáo viên từ file Excel' })
  @ApiResponse({ status: 200, description: 'Import thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Có lỗi trong dữ liệu, file lỗi được trả về.',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Lỗi server khi import.' })
  async importTeacher(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const result = await this.usersService.importTeacher(file);

    if (result.success) {
      return res.status(200).json({
        message: result.message,
        importedCount: result.importedCount,
      });
    } else {
      // Chỉ gửi file lỗi, không gửi JSON sau đó
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=danh_sach_gv_loi.xlsx',
      );
      res.status(400).send(result.errorFileBuffer);
      return; // Đảm bảo không gửi thêm response
    }
  }

  @Get('import-template')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Tải xuống file mẫu import giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'File mẫu đã được tải xuống thành công.',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Lỗi server khi tải file mẫu.' })
  async downloadTeacherImportTemplate(@Res() res: Response) {
    try {
      const filePath = join(
        __dirname,
        '..',
        '..',
        'static',
        'templates',
        'danh_sach_GV_mau_import.xlsx',
      );

      await fs.access(filePath); // Kiểm tra file có tồn tại không

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=danh_sach_GV_mau_import.xlsx',
      );

      // Gửi file bằng res.sendFile
      res.sendFile(filePath, (err) => {
        if (err) {
          this.logger.error(`Lỗi khi gửi file mẫu: ${err.message}`, err.stack);
          throw new HttpException(
            'Lỗi khi tải file mẫu',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      });
    } catch (error) {
      this.logger.error(`Lỗi tải file mẫu: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Lỗi server khi tải file mẫu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('export')
  @Roles(UserRole.Admin, UserRole.Manager)
  @ApiOperation({ summary: 'Xuất danh sách giáo viên ra file Excel' })
  @ApiBody({ type: FilterTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'File Excel chứa danh sách giáo viên đã được tải xuống.',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Lỗi server khi xuất file.' })
  async exportTeachers(
    @Body() filterTeacherDto: FilterTeacherDto,
    @Res() res: Response,
  ) {
    try {
      const excelBuffer = await this.usersService.exportTeachersToExcel(filterTeacherDto);
  
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=danh_sach_giao_vien.xlsx',
      );
  
      res.status(200).send(excelBuffer);
    } catch (error) {
      this.logger.error(`Xuất danh sách giáo viên thất bại: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Lỗi server khi xuất danh sách giáo viên',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
