/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import {
  DataSource,
  DeepPartial,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';
import {
  CreateAdminDto,
  FilterAdminDto,
  ResetPasswordAdminDto,
  UpdateAdminDto,
} from './dto/admin.dto';
import {
  CreateManagerDto,
  FilterManagerDto,
  ResetPasswordManagerDto,
  UpdateManagerDto,
} from './dto/manager.dto';
import {
  CreateTeacherDto,
  FilterTeacherDto,
  ResetPasswordTeacherDto,
  TeacherProfileDto,
  UpdateTeacherDto,
} from './dto/teacher.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/auth/roles/roles.enum';
import * as XLSX from 'xlsx-js-style';
import * as bcrypt from 'bcryptjs';
import { PaginationMeta } from '@/common/dtos/response.dto';
import { capitalize } from '@/utils/capitalize.utils';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // Bản đồ ánh xạ từ giá trị Excel sang value trong DISTRICT_OPTIONS
  private readonly districtExcelMap: Record<string, string> = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    '11': '11',
    '12': '12',
    'Gò Vấp': 'GVAP',
    'Phú Nhuận': 'PNHUAN',
    'Thủ Đức': 'TDUC',
    'Bình Thạnh': 'BTHANH',
    'Bình Tân': 'BTAN',
    'Bình Chánh': 'BCHANH',
    'Tân Bình': 'TBINH',
    'Tân Phú': 'TPHU',
    'Nhà Bè': 'NBE',
    'Hóc Môn': 'HMON',
    'Củ Chi': 'CCHI',
    'Cần Giờ': 'CGIO',
    'Đức Hòa': 'DHOA',
    'Bến Lức': 'BLUC',
    'Cần Giuộc': 'CGIUOC',
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeacherProfile)
    private teacherProfileRepository: Repository<TeacherProfile>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  //########################################################//
  //#################### HELPER METHODS ####################//
  //########################################################//

  //#####===== KIỂM TRA SỰ TỒN TẠI CỦA USER =====#####//
  //##################################################//
  private async checkUserExists(userName: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { userName },
    });
    if (existingUser) {
      throw new ConflictException('Tên người dùng đã tồn tại');
    }
  }
  //##################################################//

  //#####===== XỬ LÝ ĐẶT LẠI MẬT KHẨU =====#####//
  //############################################//
  private async resetUserPassword(user: User): Promise<void> {
    const defaultPassword = `${user.userName.trim()}@`;
    user.password = await this.hashPassword(defaultPassword);
  }
  //############################################//

  //#####===== XỬ LÝ MÃ HÓA MẬT KHẨU =====#####//
  //###########################################//
  private async hashPassword(password: string): Promise<string> {
    try {
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(
        `Mã hóa mật khẩu thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi mã hóa mật khẩu');
    }
  }
  //###########################################//

  //#####===== THÊM MỚI SUPER ADMIN =====#####//
  //##########################################//
  async createSuperAdmin(): Promise<void> {
    try {
      const existingAdmin = await this.userRepository.findOne({
        where: {
          userName: this.configService.get<string>('SUPERADMIN_USERNAME'),
        },
      });

      if (existingAdmin) {
        this.logger.log('Tài khoản Superadmin đã tồn tại');
        return;
      }

      const hashedPassword = await this.hashPassword(
        this.configService.get<string>('SUPERADMIN_PASSWORD'),
      );
      const superAdmin = this.userRepository.create({
        userName: this.configService.get<string>('SUPERADMIN_USERNAME'),
        password: hashedPassword,
        role: UserRole.Admin,
        firstName: 'GEMS',
        lastName: 'Admin',
        dob: new Date(this.configService.get<string>('SUPERADMIN_DOB')),
        email: this.configService.get<string>('SUPERADMIN_EMAIL'),
        status: true,
      });

      await this.userRepository.save(superAdmin);
      this.logger.log('Tài khoản Superadmin đã được tạo thành công');
    } catch (error) {
      this.logger.error(
        `Tạo Superadmin thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi tạo Superadmin');
    }
  }
  //##########################################//

  //#####===== LẤY THÔNG TIN USER HIỆN TẠI =====#####//
  async getCurrentUser(
    userId: number,
  ): Promise<{ data: Omit<User, 'password'> }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      const { password, ...result } = user;
      return { data: result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Lấy thông tin người dùng ID: ${userId} thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi lấy thông tin người dùng',
      );
    }
  }

  //=====----- CẬP NHẬT THÔNG TIN USER -----=====//

  //#######################################################//
  //#################### ADMIN SERVICE ####################//
  //#######################################################//

  //#####===== LẤY DANH SÁCH ADMIN =====#####//
  //#########################################//
  async findAllAdmin(
    filterAdminDto: FilterAdminDto,
  ): Promise<{ data: User[]; meta: PaginationMeta }> {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.userName',
          'user.firstName',
          'user.lastName',
          'user.gender',
          'user.dob',
          'user.phoneNumber',
          'user.email',
          'user.status',
          'user.createdAt',
          'user.updatedAt',
          'user.address',
          'user.district',
          'user.province',
        ])
        .where('user.role = :role', { role: UserRole.Admin });

      if (filterAdminDto.search) {
        query.andWhere(
          '(LOWER(unaccent(user.userName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.firstName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.lastName)) LIKE LOWER(unaccent(:search)))',
          { search: `%${filterAdminDto.search}%` },
        );
      }

      const filterFields = ['gender', 'district', 'province'];
      filterFields.forEach((field) => {
        if (filterAdminDto[field] !== undefined) {
          if (filterAdminDto[field] === null) {
            query.andWhere(`user.${field} IS NULL`);
          } else {
            query.andWhere(`user.${field} = :${field}`, {
              [field]: filterAdminDto[field],
            });
          }
        }
      });

      const orderField = this.validateSortField(filterAdminDto.sortBy);
      const orderDirection =
        filterAdminDto.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(orderField, orderDirection);

      const validatedLimit = Math.min(Math.max(filterAdminDto.limit, 1), 100);
      const skip = (filterAdminDto.page - 1) * validatedLimit;

      const [data, total] = await query
        .skip(skip)
        .take(validatedLimit)
        .getManyAndCount();

      return {
        data,
        meta: {
          total,
          page: filterAdminDto.page,
          limit: validatedLimit,
          totalPages: Math.ceil(total / validatedLimit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Lấy danh sách admin thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi lấy danh sách admin',
      );
    }
  }

  private validateSortField(field?: string): string {
    const allowedSortFields = [
      'userName',
      'lastName',
      'status',
      'dob',
      'gender',
      'district',
      'province',
      'createdAt',
    ];
    return allowedSortFields.includes(field)
      ? `user.${field}`
      : 'user.createdAt';
  }
  //#########################################//

  //#####===== THÊM ADMIN =====#####//
  //################################//
  async addAdmin(createAdminDto: CreateAdminDto): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.checkUserExists(createAdminDto.userName);
      const defaultPassword = `${createAdminDto.userName.trim()}@`;
      const hashedPassword = await this.hashPassword(defaultPassword);

      const newAdmin = this.userRepository.create({
        ...createAdminDto,
        password: hashedPassword,
        role: UserRole.Admin,
        dob: createAdminDto.dob ? new Date(createAdminDto.dob) : null,
        gender:
          createAdminDto.gender !== null ? Number(createAdminDto.gender) : null,
      });

      const savedAdmin = await queryRunner.manager.save(newAdmin);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Quản trị viên ${savedAdmin.userName} đã được tạo thành công`,
      );
      return {
        message: `Quản trị viên ${savedAdmin.userName} đã được tạo thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Thêm quản trị viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi khi thêm quản trị viên');
    } finally {
      await queryRunner.release();
    }
  }
  //################################//

  //#####===== CẬP NHẬT ADMIN =====#####//
  //####################################//
  async updateAdmin(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<{ user: User; message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const admin = await queryRunner.manager.findOne(User, {
        where: { id, role: UserRole.Admin },
        lock: { mode: 'pessimistic_write' },
      });

      if (!admin) {
        throw new NotFoundException('Không tìm thấy admin');
      }

      Object.assign(admin, updateAdminDto);
      const updatedAdmin = await queryRunner.manager.save(User, admin);
      await queryRunner.commitTransaction();

      return {
        user: updatedAdmin,
        message: `Cập nhật admin ${updatedAdmin.userName} thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Cập nhật admin ID: ${id} thất bại: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate')
      ) {
        throw new ConflictException(
          'Dữ liệu cập nhật gây xung đột (username đã tồn tại)',
        );
      }
      throw new InternalServerErrorException('Lỗi khi cập nhật admin');
    } finally {
      await queryRunner.release();
    }
  }
  //####################################//

  //#####===== XÓA ADMIN =====#####//
  //###############################//
  async removeAdmin(
    ids: number[],
    currentUserId: number,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (ids.includes(currentUserId)) {
        throw new ForbiddenException('Không thể tự xóa chính mình');
      }

      const admins = await queryRunner.manager.find(User, {
        where: { id: In(ids), role: UserRole.Admin },
        lock: { mode: 'pessimistic_write' },
      });

      if (admins.length === 0) {
        throw new NotFoundException('Không tìm thấy admin để xóa');
      }

      const result = await queryRunner.manager.remove(admins);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã xóa ${result.length} admin`);
      return { message: `Đã xóa thành công ${result.length} Admin` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(`Xóa admin thất bại: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi khi xóa admin');
    } finally {
      await queryRunner.release();
    }
  }
  //###############################//

  //#####===== CẬP NHẬT TRẠNG THÁI ADMIN =====#####//
  //###############################################//
  async updateAdminStatus(
    ids: number[],
    status: boolean,
    currentUserId: number,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superAdmin = await queryRunner.manager.findOne(User, {
        where: {
          userName: this.configService.get('SUPERADMIN_USERNAME'),
          role: UserRole.Admin,
        },
      });

      if (currentUserId !== superAdmin.id) {
        throw new ForbiddenException('Chỉ SUPER ADMIN mới có quyền này');
      }

      const filteredIds = ids.filter((id) => id !== superAdmin.id);
      if (filteredIds.length === 0) {
        throw new BadRequestException(
          'Không thể thay đổi trạng thái SUPER ADMIN',
        );
      }

      const admins = await queryRunner.manager.find(User, {
        where: { id: In(filteredIds), role: UserRole.Admin },
        lock: { mode: 'pessimistic_write' },
      });

      if (admins.length === 0) {
        throw new NotFoundException('Không tìm thấy admin để cập nhật');
      }

      admins.forEach((admin) => {
        admin.status = status;
        admin.updatedAt = new Date();
      });

      await queryRunner.manager.save(admins);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} ${admins.length} Admin`,
      );
      return {
        message: `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} thành công ${admins.length} Admin`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Cập nhật trạng thái admin thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi cập nhật trạng thái admin',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //###############################################//

  //#####===== RESET MẬT KHẨU ADMIN =====#####//
  //##########################################//
  async resetAdminPassword(
    resetPasswordAdminDto: ResetPasswordAdminDto,
    currentUserId: number,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superAdmin = await queryRunner.manager.findOne(User, {
        where: {
          userName: this.configService.get('SUPERADMIN_USERNAME'),
          role: UserRole.Admin,
        },
      });

      if (currentUserId !== superAdmin.id) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới có quyền đặt lại mật khẩu Admin',
        );
      }

      const filteredIds = resetPasswordAdminDto.ids.filter(
        (id) => id !== superAdmin.id,
      );
      if (filteredIds.length === 0) {
        throw new BadRequestException('Không thể đặt lại mật khẩu Super Admin');
      }

      const admins = await queryRunner.manager.find(User, {
        where: { id: In(filteredIds), role: UserRole.Admin },
        lock: { mode: 'pessimistic_write' },
      });

      if (admins.length === 0) {
        throw new NotFoundException('Không tìm thấy Admin nào');
      }

      for (const admin of admins) {
        await this.resetUserPassword(admin);
      }

      await queryRunner.manager.save(admins);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã đặt lại mật khẩu cho ${admins.length} Admin`);
      return { message: `Đã đặt lại mật khẩu cho ${admins.length} Admin` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Đặt lại mật khẩu Admin thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi đặt lại mật khẩu Admin',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //##########################################//

  //#########################################################//
  //#################### MANAGER SERVICE ####################//
  //#########################################################//

  //#####===== LẤY DANH SÁCH MANAGER =====#####//
  //###########################################//
  async findAllManager(
    filterManagerDto: FilterManagerDto,
  ): Promise<{ data: User[]; meta: PaginationMeta }> {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.userName',
          'user.firstName',
          'user.lastName',
          'user.gender',
          'user.dob',
          'user.phoneNumber',
          'user.email',
          'user.status',
          'user.createdAt',
          'user.updatedAt',
          'user.address',
          'user.district',
          'user.province',
        ])
        .where('user.role = :role', { role: UserRole.Manager });

      if (filterManagerDto.search) {
        query.andWhere(
          '(LOWER(unaccent(user.userName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.firstName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.lastName)) LIKE LOWER(unaccent(:search)))',
          { search: `%${filterManagerDto.search}%` },
        );
      }

      const filterFields = ['gender', 'district', 'province'];
      filterFields.forEach((field) => {
        if (filterManagerDto[field] !== undefined) {
          if (filterManagerDto[field] === null) {
            query.andWhere(`user.${field} IS NULL`);
          } else {
            query.andWhere(`user.${field} = :${field}`, {
              [field]: filterManagerDto[field],
            });
          }
        }
      });

      const orderField = this.validateSortField(filterManagerDto.sortBy);
      const orderDirection =
        filterManagerDto.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(orderField, orderDirection);

      const validatedLimit = Math.min(Math.max(filterManagerDto.limit, 1), 100);
      const skip = (filterManagerDto.page - 1) * validatedLimit;

      const [data, total] = await query
        .skip(skip)
        .take(validatedLimit)
        .getManyAndCount();

      return {
        data,
        meta: {
          total,
          page: filterManagerDto.page,
          limit: validatedLimit,
          totalPages: Math.ceil(total / validatedLimit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Lấy danh sách manager thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi lấy danh sách manager',
      );
    }
  }
  //###########################################//

  //#####===== THÊM MANAGER =====#####//
  //##################################//
  async addManager(
    createManagerDto: CreateManagerDto,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.checkUserExists(createManagerDto.userName);
      const defaultPassword = `${createManagerDto.userName.trim()}@`;
      const hashedPassword = await this.hashPassword(defaultPassword);

      const newManager = this.userRepository.create({
        ...createManagerDto,
        password: hashedPassword,
        role: UserRole.Manager,
        dob: createManagerDto.dob ? new Date(createManagerDto.dob) : null,
        gender:
          createManagerDto.gender !== null
            ? Number(createManagerDto.gender)
            : null,
      });

      const savedManager = await queryRunner.manager.save(newManager);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Quản lý ${savedManager.userName} đã được tạo thành công`,
      );
      return {
        message: `Quản lý ${savedManager.userName} đã được tạo thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Thêm quản lý thất bại: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi server khi thêm quản lý');
    } finally {
      await queryRunner.release();
    }
  }
  //##################################//

  //#####===== CẬP NHẬT MANAGER =====#####//
  //######################################//
  async updateManager(
    id: number,
    updateManagerDto: UpdateManagerDto,
  ): Promise<{ user: User; message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = await queryRunner.manager.findOne(User, {
        where: { id, role: UserRole.Manager },
        lock: { mode: 'pessimistic_write' },
      });

      if (!manager) {
        throw new NotFoundException('Không tìm thấy quản lý nào');
      }

      Object.assign(manager, updateManagerDto);
      const updatedManager = await queryRunner.manager.save(User, manager);
      await queryRunner.commitTransaction();

      return {
        user: updatedManager,
        message: `Cập nhật quản lý ${updatedManager.userName} thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Lỗi cập nhật quản lý: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate')
      ) {
        throw new ConflictException(
          'Dữ liệu cập nhật gây xung đột (username đã tồn tại)',
        );
      }
      throw new InternalServerErrorException('Lỗi server khi cập nhật quản lý');
    } finally {
      await queryRunner.release();
    }
  }
  //######################################//

  //#####===== XÓA MANAGER =====#####//
  //#################################//
  async removeManager(ids: number[]): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const managers = await queryRunner.manager.find(User, {
        where: { id: In(ids), role: UserRole.Manager },
        lock: { mode: 'pessimistic_write' },
      });

      if (managers.length === 0) {
        throw new NotFoundException('Không tìm thấy quản lý nào');
      }

      const result = await queryRunner.manager.remove(managers);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã xóa ${result.length} quản lý`);
      return { message: `Đã xóa thành công ${result.length} quản lý` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Xóa manager thất bại: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi server khi xóa manager');
    } finally {
      await queryRunner.release();
    }
  }
  //#################################//

  //#####===== CẬP NHẬT TRẠNG THÁI MANAGER =====#####//
  //#################################################//
  async updateManagerStatus(
    ids: number[],
    status: boolean,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const managers = await queryRunner.manager.find(User, {
        where: { id: In(ids), role: UserRole.Manager },
        lock: { mode: 'pessimistic_write' },
      });

      if (managers.length === 0) {
        throw new NotFoundException('Không tìm thấy quản lý nào');
      }

      managers.forEach((manager) => {
        manager.status = status;
        manager.updatedAt = new Date();
      });

      await queryRunner.manager.save(managers);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} ${managers.length} quản lý`,
      );
      return {
        message: `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} thành công ${managers.length} quản lý`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Cập nhật trạng thái quản lý thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi cập nhật trạng thái quản lý',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //#################################################//

  //#####===== RESET MẬT KHẨU MANAGER =====#####//
  //############################################//
  async resetManagerPassword(
    resetPasswordManagerDto: ResetPasswordManagerDto,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const managers = await queryRunner.manager.find(User, {
        where: { id: In(resetPasswordManagerDto.ids), role: UserRole.Manager },
        lock: { mode: 'pessimistic_write' },
      });

      if (managers.length === 0) {
        throw new NotFoundException('Không tìm thấy quản lý nào');
      }

      for (const manager of managers) {
        await this.resetUserPassword(manager);
      }

      await queryRunner.manager.save(managers);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã đặt lại mật khẩu cho ${managers.length} quản lý`);
      return { message: `Đã đặt lại mật khẩu cho ${managers.length} quản lý` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Đặt lại mật khẩu quản lý thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi đặt lại mật khẩu quản lý',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //############################################//

  //#########################################################//
  //#################### TEACHER SERVICE ####################//
  //#########################################################//

  //#####===== LẤY DANH SÁCH TEACHER =====#####//
  //###########################################//
  async findAllTeacher(
    filterTeacherDto: FilterTeacherDto,
  ): Promise<{ data: User[]; meta: PaginationMeta }> {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.teacherProfile', 'teacherProfile')
        .select([
          'user.id',
          'user.userName',
          'user.firstName',
          'user.lastName',
          'user.gender',
          'user.dob',
          'user.phoneNumber',
          'user.email',
          'user.status',
          'user.createdAt',
          'user.updatedAt',
          'user.address',
          'user.district',
          'user.province',
          'teacherProfile',
        ])
        .where('user.role = :role', { role: UserRole.Teacher });

      if (filterTeacherDto.search) {
        query.andWhere(
          '(LOWER(unaccent(user.userName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.firstName)) LIKE LOWER(unaccent(:search)) OR ' +
            'LOWER(unaccent(user.lastName)) LIKE LOWER(unaccent(:search)))',
          { search: `%${filterTeacherDto.search}%` },
        );
      }

      // Phân biệt trường của user và teacherProfile
      const userFilterFields = ['gender', 'district'];
      const profileFilterFields = [
        'gemsEmployee',
        'educationLevel',
        'nvsp',
        'ic3Certificate',
        'icdlCertificate',
      ];

      // Lọc cho các trường của user
      userFilterFields.forEach((field) => {
        if (filterTeacherDto[field] !== undefined) {
          if (filterTeacherDto[field] === null) {
            query.andWhere(`user.${field} IS NULL`);
          } else {
            query.andWhere(`user.${field} = :${field}`, {
              [field]: filterTeacherDto[field],
            });
          }
        }
      });

      // Lọc cho các trường của teacherProfile
      profileFilterFields.forEach((field) => {
        if (filterTeacherDto[field] !== undefined) {
          if (filterTeacherDto[field] === null) {
            query.andWhere(`teacherProfile.${field} IS NULL`);
          } else {
            query.andWhere(`teacherProfile.${field} = :${field}`, {
              [field]: filterTeacherDto[field],
            });
          }
        }
      });

      const orderField = this.validateSortField(filterTeacherDto.sortBy);
      const orderDirection =
        filterTeacherDto.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(orderField, orderDirection);

      // Chỉ áp dụng phân trang nếu limit > 0
      const limit = filterTeacherDto.limit !== undefined ? filterTeacherDto.limit : 50;
      const validatedLimit = Math.min(Math.max(limit, 0), 500);
      let data: User[];
      let total: number;
      if (validatedLimit > 0) {
        const skip = (filterTeacherDto.page - 1) * validatedLimit;
        [data, total] = await query
          .skip(skip)
          .take(validatedLimit)
          .getManyAndCount();
      } else {
        // Xuất toàn bộ dữ liệu nếu limit = 0
        [data, total] = await query.getManyAndCount();
      }

      return {
        data,
        meta: {
          total,
          page: filterTeacherDto.page,
          limit: validatedLimit,
          totalPages: Math.ceil(total / validatedLimit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Lấy danh sách teacher thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi lấy danh sách teacher',
      );
    }
  }
  //###########################################//

  //#####===== THÊM TEACHER =====#####//
  //##################################//
  async addTeacher(
    createTeacherDto: CreateTeacherDto,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.checkUserExists(createTeacherDto.userName);
      const defaultPassword = `${createTeacherDto.userName.trim()}@`;
      const hashedPassword = await this.hashPassword(defaultPassword);

      const newTeacher = this.userRepository.create({
        userName: createTeacherDto.userName,
        password: hashedPassword,
        role: UserRole.Teacher,
        firstName: createTeacherDto.firstName,
        lastName: createTeacherDto.lastName,
        gender: createTeacherDto.gender ?? null,
        dob: createTeacherDto.dob ? new Date(createTeacherDto.dob) : null,
        phoneNumber: createTeacherDto.phoneNumber ?? null,
        email: createTeacherDto.email ?? null,
        address: createTeacherDto.address ?? null,
        district: createTeacherDto.district ?? null,
        province: createTeacherDto.province ?? null,
      });

      const savedTeacher = await queryRunner.manager.save(newTeacher);

      const teacherProfile = this.teacherProfileRepository.create({
        user: savedTeacher,
        gemsEmployee: createTeacherDto.teacherProfile?.gemsEmployee ?? null,
        educationLevel: createTeacherDto.teacherProfile?.educationLevel ?? null,
        informaticRelation:
          createTeacherDto.teacherProfile?.informaticRelation ?? null,
        nvsp: createTeacherDto.teacherProfile?.nvsp ?? null,
        ic3Certificate: createTeacherDto.teacherProfile?.ic3Certificate ?? null,
        icdlCertificate:
          createTeacherDto.teacherProfile?.icdlCertificate ?? null,
      });

      await queryRunner.manager.save(teacherProfile);
      await queryRunner.commitTransaction();

      return {
        message: `Giáo viên ${savedTeacher.userName} đã được tạo thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Thêm giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi thêm giáo viên');
    } finally {
      await queryRunner.release();
    }
  }
  //##################################//

  //#####===== CẬP NHẬT TEACHER =====#####//
  //######################################//
  async updateTeacher(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<{ user: User; message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm User với khóa FOR UPDATE, không tải quan hệ ngay
      const teacher = await queryRunner.manager.findOne(User, {
        where: { id, role: UserRole.Teacher },
        lock: { mode: 'pessimistic_write' },
      });

      if (!teacher) {
        throw new NotFoundException('Không tìm thấy giáo viên nào');
      }

      // Tải teacherProfile riêng nếu cần
      const teacherProfile = await queryRunner.manager.findOne(TeacherProfile, {
        where: { user: { id: teacher.id } },
      });

      const userFields = {
        userName: updateTeacherDto.userName,
        firstName: updateTeacherDto.firstName,
        lastName: updateTeacherDto.lastName,
        gender: updateTeacherDto.gender ?? null,
        dob: updateTeacherDto.dob ? new Date(updateTeacherDto.dob) : null,
        phoneNumber: updateTeacherDto.phoneNumber ?? null,
        email: updateTeacherDto.email ?? null,
        address: updateTeacherDto.address ?? null,
        district: updateTeacherDto.district ?? null,
        province: updateTeacherDto.province ?? null,
      };

      Object.assign(teacher, userFields);
      const updatedTeacher = await queryRunner.manager.save(User, teacher);

      if (teacherProfile) {
        const profileFields: DeepPartial<TeacherProfile> = {
          gemsEmployee: updateTeacherDto.teacherProfile?.gemsEmployee ?? null,
          educationLevel:
            updateTeacherDto.teacherProfile?.educationLevel ?? null,
          informaticRelation:
            updateTeacherDto.teacherProfile?.informaticRelation ?? null,
          nvsp: updateTeacherDto.teacherProfile?.nvsp ?? null,
          ic3Certificate:
            updateTeacherDto.teacherProfile?.ic3Certificate ?? null,
          icdlCertificate:
            updateTeacherDto.teacherProfile?.icdlCertificate ?? null,
        };
        Object.assign(teacherProfile, profileFields);
        await queryRunner.manager.save(TeacherProfile, teacherProfile);
      }

      await queryRunner.commitTransaction();

      return {
        user: updatedTeacher,
        message: `Cập nhật giáo viên ${updatedTeacher.userName} thành công`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Lỗi cập nhật giáo viên: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate')
      ) {
        throw new ConflictException(
          'Dữ liệu cập nhật gây xung đột (username hoặc email đã tồn tại)',
        );
      }
      throw new InternalServerErrorException('Lỗi khi cập nhật giáo viên');
    } finally {
      await queryRunner.release();
    }
  }
  //######################################//

  //#####===== XÓA TEACHER =====#####//
  //#################################//
  async removeTeacher(ids: number[]): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Truy vấn bảng user với khóa pessimistic_write
      const teachers = await queryRunner.manager.find(User, {
        where: { id: In(ids), role: UserRole.Teacher },
        lock: { mode: 'pessimistic_write' },
      });

      if (teachers.length === 0) {
        throw new NotFoundException('Không tìm thấy giáo viên nào');
      }

      // Truy vấn teacherProfile riêng nếu cần
      const teacherProfiles = await queryRunner.manager.find(TeacherProfile, {
        where: { user: In(ids) },
      });

      // Xóa teacherProfile trước (nếu có)
      if (teacherProfiles.length > 0) {
        await queryRunner.manager.remove(TeacherProfile, teacherProfiles);
      }

      // Xóa user
      await queryRunner.manager.remove(User, teachers);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã xóa ${teachers.length} giáo viên`);
      return { message: `Đã xóa thành công ${teachers.length} giáo viên` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Xóa giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi xóa giáo viên');
    } finally {
      await queryRunner.release();
    }
  }
  //#################################//

  //#####===== CẬP NHẬT TRẠNG THÁI TEACHER =====#####//
  //#################################################//
  async updateTeacherStatus(
    ids: number[],
    status: boolean,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teachers = await queryRunner.manager.find(User, {
        where: { id: In(ids), role: UserRole.Teacher },
        lock: { mode: 'pessimistic_write' },
      });

      if (teachers.length === 0) {
        throw new NotFoundException('Không tìm thấy giáo viên nào');
      }

      teachers.forEach((teacher) => {
        teacher.status = status;
        teacher.updatedAt = new Date();
      });

      await queryRunner.manager.save(teachers);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} ${teachers.length} giáo viên`,
      );
      return {
        message: `Đã ${status ? 'kích hoạt' : 'hủy kích hoạt'} thành công ${teachers.length} giáo viên`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Cập nhật trạng thái giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi cập nhật trạng thái giáo viên',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //#################################################//

  //#####===== RESET MẬT KHẨU TEACHER =====#####//
  //############################################//
  async resetTeacherPassword(
    resetPasswordTeacherDto: ResetPasswordTeacherDto,
  ): Promise<{ message: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teachers = await queryRunner.manager.find(User, {
        where: { id: In(resetPasswordTeacherDto.ids), role: UserRole.Teacher },
        lock: { mode: 'pessimistic_write' },
      });

      if (teachers.length === 0) {
        throw new NotFoundException('Không tìm thấy giáo viên nào');
      }

      for (const teacher of teachers) {
        await this.resetUserPassword(teacher);
      }

      await queryRunner.manager.save(teachers);
      await queryRunner.commitTransaction();

      this.logger.log(`Đã đặt lại mật khẩu cho ${teachers.length} giáo viên`);
      return {
        message: `Đã đặt lại mật khẩu cho ${teachers.length} giáo viên`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Đặt lại mật khẩu giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi đặt lại mật khẩu giáo viên',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //############################################//

  //#####===== IMPORT GIÁO VIÊN =====#####//
  //######################################//
  async importTeacher(file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    importedCount?: number;
    errorCount?: number;
    errorFileBuffer?: Buffer;
  }> {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellStyles: true,
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as Array<
      Array<string | number>
    >;

    if (data.length - 1 > 500) {
      this.logger.warn(`File vượt quá 500 dòng: ${data.length - 1} dòng`);
      throw new BadRequestException(
        'File vượt quá 500 dòng, vui lòng chia nhỏ để import',
      );
    }

    this.logger.log(
      `Bắt đầu import ${data.length - 1} giáo viên từ file Excel`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const errorCells: { row: number; col: number; error: string }[] = [];
    const teachersToSave: { user: User; profile: TeacherProfile }[] = [];
    const BATCH_SIZE = 100;

    try {
      for (let i = 1; i < data.length; i++) {
        const item = data[i];
        if (!item) {
          this.logger.warn(`Dòng ${i + 1} không có dữ liệu, bỏ qua`);
          continue;
        }

        try {
          const { user, profile } = await this.mapExcelRowToTeacher(
            item,
            i + 1,
          );
          teachersToSave.push({ user, profile });
        } catch (error) {
          const errorColumn = this.determineErrorColumn(error.message);
          errorCells.push({
            row: i + 1,
            col: errorColumn,
            error: error.message,
          });
          this.logger.warn(
            `Lỗi tại dòng ${i + 1}, cột ${errorColumn}: ${error.message}`,
          );
        }
      }

      if (errorCells.length === 0) {
        for (let i = 0; i < teachersToSave.length; i += BATCH_SIZE) {
          const batch = teachersToSave.slice(i, i + BATCH_SIZE);
          const users = batch.map((t) => t.user);
          const profiles = batch.map((t) => t.profile);

          await queryRunner.manager.save(User, users);
          profiles.forEach((p, idx) => (p.user = users[idx]));
          await queryRunner.manager.save(TeacherProfile, profiles);

          this.logger.log(
            `Đã lưu batch ${i / BATCH_SIZE + 1}: ${batch.length} giáo viên`,
          );
        }

        await queryRunner.commitTransaction();
        this.logger.log(`Import thành công ${teachersToSave.length} giáo viên`);

        return {
          success: true,
          message: `Tải lên thành công, đã thêm vào hệ thống ${teachersToSave.length} giáo viên.`,
          importedCount: teachersToSave.length,
        };
      } else {
        await queryRunner.rollbackTransaction();
        this.logger.warn(`Import thất bại với ${errorCells.length} lỗi`);

        // Tô đỏ ô lỗi và thêm ghi chú vào cột 15
        errorCells.forEach(({ row, col, error }) => {
          const errorCellAddress = XLSX.utils.encode_cell({
            r: row - 1,
            c: col,
          });
          const noteCellAddress = XLSX.utils.encode_cell({ r: row - 1, c: 15 }); // Cột 15

          // Tô đỏ ô lỗi
          if (!worksheet[errorCellAddress]) {
            worksheet[errorCellAddress] = { t: 's', v: '' };
          }
          worksheet[errorCellAddress].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'FF7474' }, // Màu đỏ nhạt
            },
          };

          // Thêm ghi chú lỗi vào cột 15
          if (!worksheet[noteCellAddress]) {
            worksheet[noteCellAddress] = { t: 's', v: error };
          } else {
            worksheet[noteCellAddress].v = error; // Ghi đè nếu đã có dữ liệu
          }
          worksheet[noteCellAddress].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'FFFF99' }, // Màu vàng nhạt cho ghi chú
            },
          };
        });

        const newBuffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'xlsx',
        });

        return {
          success: false,
          message: `Tải lên thành công, nhưng có ${errorCells.length} giáo viên lỗi. Kiểm tra file để cập nhật lại.`,
          errorCount: errorCells.length,
          errorFileBuffer: newBuffer,
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Import giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Lỗi server khi import giáo viên');
    } finally {
      await queryRunner.release();
    }
  }

  //#####===== ÁNH XẠ DỮ LIỆU TỪ EXCEL =====#####//
  private async mapExcelRowToTeacher(
    item: Array<string | number>,
    rowIndex: number,
  ): Promise<{ user: User; profile: TeacherProfile }> {
    // Xử lý tên tài khoản (cột 0 - không bắt buộc)
    let userName = (item[0] as string)?.trim() || null;

    // Cột bắt buộc: Họ và Tên (cột 1)
    const fullName = (item[1] as string)?.trim();
    if (!fullName) {
      throw new BadRequestException(
        `Họ và Tên (dòng ${rowIndex}) không được để trống`,
      );
    }

    // Cột bắt buộc: Ngày tháng năm sinh (cột 2)
    const dobRaw = (item[2] as string)?.trim();
    if (!dobRaw || !/^\d{2}\/\d{2}\/\d{4}$/.test(dobRaw)) {
      throw new BadRequestException(
        `Ngày sinh (dòng ${rowIndex}) phải có định dạng DD/MM/YYYY`,
      );
    }

    // Cột bắt buộc: GV GEMS? (cột 3)
    const gemsEmployeeRaw = item[3];
    if (
      gemsEmployeeRaw === undefined ||
      gemsEmployeeRaw === '' ||
      isNaN(Number(gemsEmployeeRaw))
    ) {
      throw new BadRequestException(
        `GV GEMS (dòng ${rowIndex}) không được để trống và phải là 0 hoặc 1`,
      );
    }
    const gemsEmployee = Number(gemsEmployeeRaw);
    if (![0, 1].includes(gemsEmployee)) {
      throw new BadRequestException(
        `GV GEMS (dòng ${rowIndex}) phải là 0 hoặc 1`,
      );
    }

    // Nếu Tên tài khoản trống, tự động tạo từ Họ và Tên + Ngày sinh
    if (!userName) {
      userName = await this.generateTeacherUsername(fullName, dobRaw);
    }

    // Kiểm tra trùng userName
    await this.checkUserExists(userName);

    // Các cột không bắt buộc
    const genderRaw = item[4] as string; // Cột 4: Giới tính
    const gender =
      genderRaw !== undefined && genderRaw !== '' ? Number(genderRaw) : null;

    const rawEmail = (item[5] as string)?.trim(); // Cột 5: Email
    const email = rawEmail ? rawEmail.toLowerCase().replace(/\s+/g, '') : null;

    const phoneNumber = (item[6] as string)?.trim() || null; // Cột 6: Số điện thoại
    const address = (item[7] as string)?.trim() || null; // Cột 7: Địa chỉ

    const districtLabel = (item[8] as string)?.trim(); // Cột 8: Quận/Huyện
    let districtValue: string | null = null;
    if (districtLabel) {
      districtValue = this.districtExcelMap[districtLabel];
      if (!districtValue) {
        throw new BadRequestException(
          `Quận/Huyện (dòng ${rowIndex}) không hợp lệ: ${districtLabel}`,
        );
      }
    }

    const province = (item[9] as string)?.trim() || null; // Cột 9: Thành Phố

    const educationLevelRaw = item[10]; // Cột 10: Trình độ học vấn
    const educationLevel =
      educationLevelRaw !== undefined && educationLevelRaw !== ''
        ? Number(educationLevelRaw)
        : null;

    const informaticRelationRaw = item[11]; // Cột 11: Ngành tin học
    const informaticRelation =
      informaticRelationRaw !== undefined && informaticRelationRaw !== ''
        ? Number(informaticRelationRaw)
        : null;

    const nvspRaw = item[12]; // Cột 12: Chứng chỉ NVSP
    const nvsp =
      nvspRaw !== undefined && nvspRaw !== '' ? Number(nvspRaw) : null;

    const ic3CertificateRaw = item[13]; // Cột 13: Chứng chỉ IC3
    const ic3Certificate =
      ic3CertificateRaw !== undefined && ic3CertificateRaw !== ''
        ? Number(ic3CertificateRaw)
        : null;

    const icdlCertificateRaw = item[14]; // Cột 14: ICDL
    const icdlCertificate =
      icdlCertificateRaw !== undefined && icdlCertificateRaw !== ''
        ? Number(icdlCertificateRaw)
        : null;

    // Chuẩn hóa tên
    const nameParts = fullName.split(' ').filter(Boolean);
    const lastName = capitalize(nameParts.pop() || '');
    const firstName = capitalize(nameParts.length ? nameParts.join(' ') : '');
    const defaultPassword = `${userName}@`;

    // Tạo entity User
    const user = this.userRepository.create({
      userName,
      password: await this.hashPassword(defaultPassword),
      role: UserRole.Teacher,
      firstName,
      lastName,
      dob: new Date(dobRaw.split('/').reverse().join('-')),
      gender,
      email,
      phoneNumber,
      address,
      district: districtValue,
      province,
    });

    // Tạo entity TeacherProfile
    const profile = this.teacherProfileRepository.create({
      user,
      gemsEmployee,
      educationLevel,
      informaticRelation,
      nvsp,
      ic3Certificate,
      icdlCertificate,
    });

    // Validate các cột không bắt buộc (nếu có dữ liệu)
    if (gender !== null && (isNaN(gender) || ![0, 1].includes(gender))) {
      throw new BadRequestException(
        `Giới tính (dòng ${rowIndex}) phải là 0 (Nam) hoặc 1 (Nữ)`,
      );
    }
    if (
      educationLevel !== null &&
      (isNaN(educationLevel) || ![0, 1, 2, 3].includes(educationLevel))
    ) {
      throw new BadRequestException(
        `Trình độ học vấn (dòng ${rowIndex}) phải từ 0-3`,
      );
    }
    if (
      informaticRelation !== null &&
      ![0, 1].includes(Number(informaticRelationRaw))
    ) {
      throw new BadRequestException(
        `Ngành tin học (dòng ${rowIndex}) phải là 0 hoặc 1`,
      );
    }
    if (nvsp !== null && (isNaN(nvsp) || ![0, 1, 2, 3].includes(nvsp))) {
      throw new BadRequestException(
        `Chứng chỉ NVSP (dòng ${rowIndex}) phải từ 0-3`,
      );
    }
    if (
      ic3Certificate !== null &&
      ![0, 1].includes(Number(ic3CertificateRaw))
    ) {
      throw new BadRequestException(
        `Chứng chỉ IC3 (dòng ${rowIndex}) phải là 0 hoặc 1`,
      );
    }
    if (
      icdlCertificate !== null &&
      ![0, 1].includes(Number(icdlCertificateRaw))
    ) {
      throw new BadRequestException(
        `Chứng chỉ ICDL (dòng ${rowIndex}) phải là 0 hoặc 1`,
      );
    }

    return { user, profile };
  }

  //#####===== XÁC ĐỊNH CỘT LỖI =====#####//
  private determineErrorColumn(errorMessage: string): number {
    const errorMap = {
      'Tên người dùng': 0,
      'Họ và Tên': 1,
      'Ngày sinh': 2,
      'GV GEMS': 3,
      'Giới tính': 4,
      Email: 5,
      'Số điện thoại': 6,
      'Địa chỉ': 7,
      'Quận/Huyện': 8,
      'Thành Phố': 9,
      'Trình độ học vấn': 10,
      'Ngành liên quan đến tin học': 11,
      'Chứng chỉ NVSP': 12,
      'Chứng chỉ IC3': 13,
      ICDL: 14,
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    return 0;
  }

  //#####===== TẠO TÊN GIÁO VIÊN =====#####//
  private async generateTeacherUsername(
    fullName: string,
    dob: string,
  ): Promise<string> {
    const dobParts = dob.split('/');
    const baseUsername = `${fullName}${dobParts[0]}${dobParts[1]}`
      .toLowerCase()
      .replace(/\s+/g, '') // Loại bỏ khoảng trắng
      .normalize('NFD') // Phân tách ký tự có dấu
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu thanh
      .replace(/[đ]/g, 'd') // Thay 'đ' bằng 'd'
      .replace(/[ăâ]/g, 'a') // Thay 'ă', 'â' bằng 'a'
      .replace(/[ê]/g, 'e') // Thay 'ê' bằng 'e'
      .replace(/[ôơ]/g, 'o') // Thay 'ô', 'ơ' bằng 'o'
      .replace(/[ư]/g, 'u'); // Thay 'ư' bằng 'u'

    let username = baseUsername;
    let counter = 1;

    while (
      await this.userRepository.findOne({ where: { userName: username } })
    ) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  async exportTeachersToExcel(
    filterTeacherDto: FilterTeacherDto,
  ): Promise<Buffer> {
    try {
      // Lấy danh sách giáo viên từ database
      // Ghi đè limit để xuất toàn bộ dữ liệu
      const exportFilter = { ...filterTeacherDto, limit: 0 };
      const { data: teachers } = await this.findAllTeacher(exportFilter);

      // Định nghĩa header cho file Excel
      const headers = [
        'Tên tài khoản',
        'Họ & chữ đệm',
        'Tên',
        'Giới tính',
        'Ngày sinh',
        'Số điện thoại',
        'Email',
        'Địa chỉ',
        'Quận/Huyện',
        'Tỉnh/Thành phố',
        'Đơn vị',
        'Trình độ học vấn',
        'Ngành tin học',
        'C/chỉ NVSP',
        'C/chỉ IC3',
        'C/chỉ ICDL',
        'Ngày tạo',
      ];

      // Hàm hỗ trợ định dạng ngày thành DD/MM/YYYY
      const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo 2 chữ số
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() từ 0-11 nên +1
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Chuyển đổi dữ liệu giáo viên thành mảng 2D cho Excel
      const excelData = teachers.map((teacher) => {
        const profile = (teacher.teacherProfile as TeacherProfileDto) || {};
        return [
          teacher.userName || '',
          teacher.firstName || '',
          teacher.lastName || '',
          teacher.gender === 0 ? 'Nam' : teacher.gender === 1 ? 'Nữ' : '',
          formatDate(teacher.dob),
          teacher.phoneNumber || '',
          teacher.email || '',
          teacher.address || '',
          teacher.district || '',
          teacher.province || '',
          profile.gemsEmployee === 1 ? 'GEMS' : 'Trường',
          profile.educationLevel !== null
            ? ['Trung cấp', 'Cao đẳng', 'Đại học', 'Sau đại học'][
                profile.educationLevel
              ] || ''
            : '',
          profile.informaticRelation === 1
            ? 'Có'
            : profile.informaticRelation === 0
              ? 'Không'
              : '',
          profile.nvsp !== null
            ? ['Chưa có', 'Tiểu học', 'THCS', 'Cả 2 cấp'][profile.nvsp] || ''
            : '',
          profile.ic3Certificate === 1
            ? 'Đã có'
            : profile.ic3Certificate === 0
              ? 'Chưa có'
              : '',
          profile.icdlCertificate === 1
            ? 'Đã có'
            : profile.icdlCertificate === 0
              ? 'Chưa có'
              : '',
          formatDate(teacher.createdAt),
        ];
      });

      // Thêm header vào dữ liệu
      const worksheetData = [headers, ...excelData];

      // Tạo worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Định dạng header: in đậm, màu nền xanh nhạt
      const headerRange = XLSX.utils.decode_range('A1:Q1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { patternType: 'solid', fgColor: { rgb: 'CCE5FF' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }

      // Tự động điều chỉnh độ rộng cột
      const colWidths = headers.map((header, i) => ({
        wch: Math.max(
          header.length,
          ...excelData.map((row) => row[i]?.toString().length || 0),
        ),
      }));
      worksheet['!cols'] = colWidths;

      // Tạo workbook và thêm worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách giáo viên');

      // Xuất file Excel dưới dạng Buffer
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      this.logger.log(
        `Xuất danh sách ${teachers.length} giáo viên ra Excel thành công`,
      );
      return excelBuffer; // Trả về cả buffer và filename
    } catch (error) {
      this.logger.error(
        `Xuất danh sách giáo viên thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi xuất danh sách giáo viên',
      );
    }
  }

  //#########################################################//
  //#################### STUDENT SERVICE ####################//
  //#########################################################//

  //#####===== XỬ LÝ THÊM HỌC SINH VÀO LỚP HỌC =====#####//
  //#####################################################//
  async assignStudentToClass(
    studentId: number,
    classId: number,
  ): Promise<void> {
    try {
      const student = await this.userRepository.findOneBy({
        id: studentId,
        role: 3,
      });

      if (!student) {
        throw new NotFoundException('Học sinh không tồn tại');
      }

      student.classId = classId;
      await this.userRepository.save(student);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Thêm học sinh ID: ${studentId} vào lớp thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi thêm học sinh vào lớp',
      );
    }
  }
  //#####################################################//

  //#####===== LẤY DANH SÁCH HỌC SINH THEO LỚP HỌC =====#####//
  //#########################################################//
  async getClassStudents(classId: number): Promise<User[]> {
    try {
      const students = await this.userRepository.find({
        where: {
          role: 3,
          classId: classId,
        },
        select: ['id', 'firstName', 'lastName'],
      });

      return students;
    } catch (error) {
      this.logger.error(
        `Lấy danh sách học sinh lớp ${classId} thất bại: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Lỗi server khi lấy danh sách học sinh',
      );
    }
  }
  //#########################################################//
}
