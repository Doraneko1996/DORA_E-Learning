import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Teacher } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, IsNull, Repository } from 'typeorm';
import { CreateAdminDto, FilterAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { ConfigService } from '@nestjs/config';
import { SuperAdminSeeder } from '../database/seeders/superadmin.seeder';
import { UserRole } from 'src/auth/roles/roles.enum';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import * as Multer from 'multer';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
        private configService: ConfigService
    ) { }

    //=====----- TẠO MỚI SUPERADMIN -----=====//
    async createSuperAdmin() {
        const superAdminSeeder = new SuperAdminSeeder(this.userRepository, this.configService);
        await superAdminSeeder.seed();
    }

    //=====----- MÃ HÓA PASSWORD -----=====//
    private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }

    //=====----- LẤY THÔNG TIN USER HIỆN TẠI -----=====//
    async getCurrentUser(userId: number): Promise<any> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new HttpException(
                    'Người dùng không tồn tại',
                    HttpStatus.NOT_FOUND
                );
            }

            const { password, refresh_token, ...result } = user;
            return {
                success: true,
                message: 'Lấy thông tin người dùng thành công.',
                data: result
            };
        } catch (error) {
            this.logger.error(
                `Lấy thông tin người dùng thất bại: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    //=====----- CẬP NHẬT THÔNG TIN USER -----=====//
    async updateProfile(userId: number, updateData: any) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new NotFoundException('Không tìm thấy thông tin người dùng');
            }

            // Các trường cơ bản cho mọi role
            const baseFields = [
                'first_name',
                'last_name',
                'gender',
                'dob',
                'phone_number',
                'email',
                'address',
                'district',
                'province'
            ];

            // Lọc dữ liệu dựa trên role
            let allowedFields = [...baseFields];
            let filteredData: any = {};

            switch (user.role) {
                case UserRole.Teacher:
                    // Thêm các trường cho giáo viên
                    allowedFields = [
                        ...allowedFields,
                        'gems_employee',
                        'education_level',
                        'informatic_relation',
                        'nvsp',
                        'ic3_certificate',
                        'icdl_certificate'
                    ];

                    // Tìm thông tin giáo viên
                    const teacher = await this.teacherRepository.findOne({
                        where: { id: userId }
                    });

                    if (!teacher) {
                        throw new NotFoundException('Không tìm thấy thông tin giáo viên');
                    }

                    // Cập nhật thông tin giáo viên
                    const teacherFields = allowedFields.filter(field => 
                        !baseFields.includes(field)
                    );

                    // Tách dữ liệu cho teacher và user
                    const teacherData = {};
                    const userData = {};

                    Object.keys(updateData).forEach(key => {
                        if (teacherFields.includes(key)) {
                            teacherData[key] = updateData[key];
                        } else if (baseFields.includes(key)) {
                            userData[key] = updateData[key];
                        }
                    });

                    // Cập nhật teacher
                    if (Object.keys(teacherData).length > 0) {
                        Object.assign(teacher, teacherData);
                        await this.teacherRepository.save(teacher);
                    }

                    // Cập nhật user
                    if (Object.keys(userData).length > 0) {
                        Object.assign(user, userData);
                        await this.userRepository.save(user);
                    }

                    // Kết hợp dữ liệu để trả về
                    filteredData = { ...userData, ...teacherData };
                    break;

                case UserRole.Admin:
                case UserRole.Manager:
                case UserRole.Student:
                    // Chỉ cập nhật các trường cơ bản
                    Object.keys(updateData).forEach(key => {
                        if (baseFields.includes(key)) {
                            filteredData[key] = updateData[key];
                        }
                    });

                    Object.assign(user, filteredData);
                    await this.userRepository.save(user);
                    break;

                default:
                    throw new BadRequestException('Role không hợp lệ');
            }

            // Lấy thông tin user đã cập nhật
            const updatedUser = await this.userRepository.findOne({
                where: { id: userId }
            });

            // Loại bỏ các trường nhạy cảm
            const { password, refresh_token, ...userResponse } = updatedUser;

            return {
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: {
                    ...userResponse,
                    ...(user.role === UserRole.Teacher ? filteredData : {})
                }
            };

        } catch (error) {
            this.logger.error(
                `Cập nhật thông tin người dùng thất bại: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    //=====----- TÌM KIẾM USER -----=====//
    async findOne(id: number) {
        return this.userRepository.findOne({ where: { id } });
    }

    //=====----- CẬP NHẬT TRẠNG THÁI USER -----=====//
    async updateStatus(id: number, status: boolean) {
        try {
            const user = await this.userRepository.findOne({
                where: { id }
            });

            if (!user) {
                throw new NotFoundException('Không tìm thấy tài khoản.');
            }

            user.status = status ? 1 : 0;

            const updatedUser = await this.userRepository.save(user);
            return {
                success: true,
                message: 'Cập nhật trạng thái thành công.',
                data: updatedUser
            };

        } catch (error) {
            this.logger.error(
                `Cập nhật trạng thái thất bại: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    //=====----- LẤY DANH SÁCH ADMIN -----=====//
    async findAllAdmin(filterAdminDto: FilterAdminDto): Promise<{ data: User[]; total: number; page: number; limit: number }> {
        try {
            const { page = 1, limit = 10, sortBy = 'created_at', order = 'DESC', search, gender, district, province } = filterAdminDto;
            const skip = (page - 1) * limit;

            let whereClause: any = { role: UserRole.Admin };

            if (search) {
                whereClause = [
                    { ...whereClause, first_name: ILike(`%${search}%`) },
                    { ...whereClause, last_name: ILike(`%${search}%`) },
                    { ...whereClause, user_name: ILike(`%${search}%`) }
                ];
            }

            if (gender !== undefined) {
                const genderCondition = gender === 'null' ? IsNull() : parseInt(gender);
                whereClause = Array.isArray(whereClause)
                    ? whereClause.map(clause => ({ ...clause, gender: genderCondition }))
                    : { ...whereClause, gender: genderCondition };
            }

            if (district !== undefined) {
                const districtCondition = district === 'null' ? IsNull() : district;
                whereClause = Array.isArray(whereClause)
                    ? whereClause.map(clause => ({ ...clause, district: districtCondition }))
                    : { ...whereClause, district: districtCondition };
            }

            if (province !== undefined) {
                const provinceCondition = province === 'null' ? IsNull() : province;
                whereClause = Array.isArray(whereClause)
                    ? whereClause.map(clause => ({ ...clause, province: provinceCondition }))
                    : { ...whereClause, province: provinceCondition };
            }

            const allowedSortFields = [
                'user_name', 'first_name', 'last_name', 'status', 'gender',
                'district', 'province', 'created_at', 'updated_at'
            ];

            const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

            const [data, total] = await this.userRepository.findAndCount({
                where: whereClause,
                select: [
                    'id', 'user_name', 'first_name', 'last_name', 'status', 'email',
                    'phone_number', 'gender', 'dob', 'address', 'district', 'province',
                    'created_at', 'updated_at'
                ],
                order: { [sortField]: order },
                skip,
                take: limit,
            });

            return { data, total, page, limit };
        } catch (error) {
            this.logger.error(`Lấy danh sách admin thất bại: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Có lỗi xảy ra khi lấy danh sách admin');
        }
    }

    //=====----- THÊM ADMIN -----=====//
    async addAdmin(createAdminDto: CreateAdminDto): Promise<{ user: User, message: string }> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { user_name: createAdminDto.user_name }
            });
    
            if (existingUser) {
                throw new HttpException('Tên người dùng đã tồn tại!', HttpStatus.CONFLICT);
            }

            const gender = createAdminDto.gender === 'null' ? null : Number(createAdminDto.gender);
    
            const hashedPassword = await this.hashPassword(createAdminDto.password);
    
            const newAdmin = this.userRepository.create({
                ...createAdminDto,
                password: hashedPassword,
                role: UserRole.Admin,
                gender,
            });

            const savedAdmin = await this.userRepository.save(newAdmin);

            return {
                user: savedAdmin,
                message: `Admin: ${savedAdmin.user_name} đã được tạo thành công.`
            };
        } catch (error) {
            this.logger.error(`Thêm admin thất bại: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Có lỗi xảy ra khi thêm admin');
        }
    }

    //=====----- CẬP NHẬT ADMIN -----=====//
    async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<{ user: User, message: string }> {
        try {
            const admin = await this.userRepository.findOne({ where: { id, role: UserRole.Admin } });

            if (!admin) {
                throw new NotFoundException('Không tìm thấy admin.');
            }

            Object.assign(admin, updateAdminDto);
            const updatedAdmin = await this.userRepository.save(admin);

            return {
                user: updatedAdmin,
                message: `Admin: ${updatedAdmin.user_name} đã được cập nhật thành công.`
            };
        } catch (error) {
            this.logger.error(`Cập nhật admin thất bại: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Có lỗi xảy ra khi cập nhật admin');
        }
    }

    //=====----- XÓA ADMIN -----=====//
    async removeAdmin(ids: number[], currentUserId: number): Promise<{ message: string, deletedCount: number }> {
        try {
            if (ids.includes(currentUserId)) {
                throw new ForbiddenException('Bạn không thể tự xóa chính mình.');
            }

            const adminsToDelete = await this.userRepository.findBy({
                id: In(ids),
                role: UserRole.Admin
            });

            if (adminsToDelete.length === 0) {
                throw new NotFoundException('Không tìm thấy admin để xóa.');
            }

            const deleteIds = adminsToDelete.map(admin => admin.id);

            const result = await this.userRepository.delete(deleteIds);

            const deletedCount = result.affected || 0;

            return {
                message: `Đã xóa thành công ${deletedCount} admin.`,
                deletedCount
            };

        } catch (error) {
            this.logger.error(`Xóa admin thất bại: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Có lỗi xảy ra khi xóa admin');
        }
    }

    //=====----- LẤY DANH SÁCH GIÁO VIÊN -----=====//
    async findAllTeachers(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'id',
        order: 'ASC' | 'DESC' = 'ASC',
        filter: any = {},
    ): Promise<{ data: Teacher[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.teacherRepository.findAndCount({
            where: filter,
            order: { [sortBy]: order },
            skip,
            take: limit,
        });

        return { data, total, page, limit };
    }

    //=====----- TÌM KIẾM GIÁO VIÊN -----=====//
    async findOneTeacher(id: number): Promise<Teacher> {
        return await this.teacherRepository.findOne({ where: { id } });
    }

    async createTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
        try {
            const hashedPassword = await this.hashPassword(createTeacherDto.password);
            const teacher = this.teacherRepository.create({
                ...createTeacherDto,
                password: hashedPassword
            });
            return await this.teacherRepository.save(teacher);
        } catch (error) {
            throw new HttpException('Lỗi server khi tạo giáo viên mới.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //=====----- CẬP NHẬT GIÁO VIÊN -----=====//
    async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
        await this.teacherRepository.update(id, updateTeacherDto);
        return this.findOneTeacher(id);
    }

    async removeTeacher(id: number): Promise<void> {
        await this.teacherRepository.delete(id);
    }

    //=====----- IMPORT GIÁO VIÊN -----=====//
    async importTeachers(file: Multer.File, res): Promise<void> {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as Array<Array<string | number>>;

        const errorCells: { row: number; col: number; error: string }[] = [];

        for (let i = 1; i < data.length; i++) {
            const item = data[i];
            const teacher = new Teacher();
            teacher.user_name = (item[0] as string)?.trim() || '';

            const fullName = (item[1] as string).trim();
            const nameParts = fullName.split(' ');
            teacher.first_name = nameParts.pop() || '';
            teacher.last_name = nameParts.join(' ');

            teacher.dob = new Date(item[2] as string);
            teacher.gems_employee = Boolean(item[3]);
            teacher.gender = Number(item[4]);
            teacher.email = item[5] as string;
            teacher.phone_number = item[6] as string;
            teacher.address = item[7] as string;
            teacher.district = item[8] as string;
            teacher.province = item[9] as string;
            teacher.education_level = Number(item[10]);
            teacher.informatic_relation = Boolean(item[11]);
            teacher.nvsp = Number(item[12]);
            teacher.ic3_certificate = Boolean(item[13]);
            teacher.icdl_certificate = Boolean(item[14]);

            if (!teacher.user_name) {
                teacher.user_name = await this.generateTeacherUsername(fullName, teacher.dob.toISOString());
            }
            teacher.password = await this.hashPassword('123456');
            teacher.role = 2;

            try {
                await this.createTeacher(teacher);
            } catch (error) {
                // Xác định cột gây ra lỗi
                let errorColumn = this.determineErrorColumn(error.message);
                errorCells.push({ row: i + 1, col: errorColumn, error: error.message });
            }
        }

        if (errorCells.length > 0) {
            // Tô màu các ô lỗi
            errorCells.forEach(({ row, col }) => {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
                worksheet[cellAddress].s = { fill: { fgColor: { rgb: "FF7474" } } };
            });

            // Ghi workbook đã được chỉnh sửa vào buffer
            const newBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Gửi file đã được chỉnh sửa cho người dùng
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=danh_sach_gv_loi.xlsx');
            res.send(newBuffer);

            // Gửi thông báo lỗi
            return res.status(400).json({
                message: `Tải lên thành công, nhưng có ${errorCells.length} GV lỗi. Kiểm tra file để cập nhật lại.`,
                errorCount: errorCells.length
            });
        }

        return res.status(200).json({
            message: `Tải lên thành công, đã thêm vào hệ thống ${data.length - 1} GV.`,
            importedCount: data.length - 1
        });
    }

    //=====----- XÁC ĐỊNH CỘT LỖI -----=====//
    private determineErrorColumn(errorMessage: string): number {
        const errorMap = {
            'user_name': 0,
            'first_name': 1,
            'last_name': 1,
            'dob': 2,
            'gems_employee': 3,
            'gender': 4,
            'email': 5,
            'phone_number': 6,
            'address': 7,
            'district': 8,
            'province': 9,
            'education_level': 10,
            'informatic_relation': 11,
            'nvsp': 12,
            'ic3_certificate': 13,
            'icdl_certificate': 14
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (errorMessage.includes(key)) {
                return value;
            }
        }
        return 0;
    }

    //=====----- TẠO TÊN GIÁO VIÊN -----=====//
    private async generateTeacherUsername(fullName: string, dob: string): Promise<string> {
        const dobParts = dob.split('/'); // Định dạng ngày sinh là DD/MM/YYYY
        const baseUsername = `${fullName}${dobParts[0]}${dobParts[1]}`.toLowerCase().replace(/\s+/g, '');

        let username = baseUsername;
        let counter = 1;

        while (await this.teacherRepository.findOne({ where: { user_name: username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        return username;
    }
}
