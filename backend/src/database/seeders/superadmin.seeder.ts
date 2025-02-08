import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminSeeder {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService
    ) { }

    async seed() {
        try {
            const superadminExists = await this.userRepository.findOne({
                where: { role: 0 },
            });
    
            if (!superadminExists) {
                const username = this.configService.get<string>('SUPERADMIN_USERNAME');
                const password = this.configService.get<string>('SUPERADMIN_PASSWORD');
                const email = this.configService.get<string>('SUPERADMIN_EMAIL');
                const dob = this.configService.get<string>('SUPERADMIN_DOB');
    
                const hashedPassword = await bcrypt.hash(password, 10);
                const superadmin = this.userRepository.create({
                    user_name: username,
                    password: hashedPassword,
                    role: 0,
                    first_name: 'GEMS',
                    last_name: 'Admin',
                    dob: this.parseDateString(dob),
                    email: email,
                    status: 1,
                });
    
                await this.userRepository.save(superadmin);
                console.log('Tài khoản Superadmin đã được tạo thành công');
            } else {
                console.log('Tài khoản Superadmin đã tồn tại');
            }
        } catch (error) {
            console.error('Lỗi khi tạo Superadmin:', error);
        }
    }

    private parseDateString(dateString: string): Date {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
}
