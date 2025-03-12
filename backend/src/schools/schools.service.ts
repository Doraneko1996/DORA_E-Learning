import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';
import { Class } from '@/classes/entities/class.entity';
import { User } from '@/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { DeleteSchoolsDto } from './dto/delete-school.dto';
import { FilterSchoolDto } from './dto/filter-school.dto';
import { PaginationMeta } from '@/common/dtos/response.dto';
import { UserRole } from '@/auth/roles/roles.enum';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
  ) { }

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate managers
      await this.validateManagers(
        createSchoolDto.academicManagerId,
        createSchoolDto.technicalManagerId
      );

      const school = this.schoolRepository.create({
        ...createSchoolDto,
        startDate: new Date(createSchoolDto.startDate)
      });

      const savedSchool = await queryRunner.manager.save(school);
      await queryRunner.commitTransaction();
      return savedSchool;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Thêm trường thất bại: ${error.message}`, error.stack);
      throw error instanceof ConflictException
        ? error
        : new ConflictException('Thêm trường thất bại do xung đột dữ liệu');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    filters?: FilterSchoolDto
  ): Promise<{ data: School[]; meta: PaginationMeta }> {
    const query = this.schoolRepository
      .createQueryBuilder('school')
      .leftJoinAndSelect('school.academicManager', 'academicManager')
      .leftJoinAndSelect('school.technicalManager', 'technicalManager')
      .loadRelationCountAndMap('school.classCount', 'school.classes');

    // Filter logic
    if (filters?.search) {
      query.andWhere(
        '(LOWER(unaccent(school.name)) LIKE LOWER(unaccent(:search)) OR ',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.educationLevel) {
      query.andWhere('school.educationLevel = :educationLevel', {
        educationLevel: filters.educationLevel
      });
    }

    if (filters?.province) {
      query.andWhere('school.province = :province', { province: filters.province });
    }

    if (filters?.district) {
      query.andWhere('school.district = :district', { district: filters.district });
    }

    // Sorting
    const orderField = this.validateSortField(filters?.sortBy);
    const orderDirection = filters?.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query.orderBy(orderField, orderDirection);

    // Pagination
    const validatedLimit = Math.min(Math.max(filters?.limit, 1), 100);
    const skip = (filters?.page - 1) * validatedLimit;

    const [data, total] = await query
      .skip(skip)
      .take(validatedLimit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total: total,       
        page: filters?.page,
        limit: validatedLimit,
        totalPages: Math.ceil(total / validatedLimit)
      }
    };
  }

  private validateSortField(field?: string): string {
    const validFields = ['name', 'createdAt', 'classCount'];
    return validFields.includes(field) ? `school.${field}` : 'school.name';
  }

  findOne(id: number) {
    return `This action returns a #${id} school`;
  }

  update(id: number, updateSchoolDto: UpdateSchoolDto) {
    return `This action updates a #${id} school`;
  }

  async remove(deleteDto: DeleteSchoolsDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lấy danh sách ID lớp học
      const classIds = (await queryRunner.manager.find(Class, {
        where: { school: { id: In(deleteDto.ids) } },
        select: ['id']
      })).map(c => c.id);

      // 2. Xóa quan hệ giáo viên-lớp học
      if (classIds.length > 0) {
        await queryRunner.manager.query(
          `DELETE FROM teacher_classes WHERE class_id IN (${classIds.join(',')})`
        );
      }

      // 3. Xóa học sinh
      await queryRunner.manager.delete(User, {
        role: 3,
        classId: In(classIds.length > 0 ? classIds : [0])
      });

      // 4. Xóa lớp học
      await queryRunner.manager.delete(Class, {
        school: { id: In(deleteDto.ids) }
      });

      // 5. Xóa trường học
      const result = await queryRunner.manager.delete(School, {
        id: In(deleteDto.ids)
      });

      if (result.affected === 0) {
        throw new NotFoundException('Không tìm thấy trường học để xóa');
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Đã xóa ${result.affected} trường học thành công`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Lỗi xóa trường: ${error.message}`);
      throw error instanceof NotFoundException ? error : new ConflictException('Lỗi xóa dữ liệu do xung đột');
    } finally {
      await queryRunner.release();
    }
  }

  private async validateManagers(
    academicManagerId?: number,
    technicalManagerId?: number
  ): Promise<void> {
    const validateManager = async (id: number, allowedRoles: number[]) => {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'role']
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng có ID ${id}`);
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ConflictException(
          `Người dùng ID ${id} phải có quyền Admin hoặc Quản lý để được gán vị trí này`
        );
      }
    };

    const promises = [];

    if (academicManagerId) {
      promises.push(validateManager(academicManagerId, [UserRole.Admin, UserRole.Manager]));
    }

    if (technicalManagerId) {
      promises.push(validateManager(technicalManagerId, [UserRole.Admin, UserRole.Manager]));
    }

    await Promise.all(promises);
  }
}
