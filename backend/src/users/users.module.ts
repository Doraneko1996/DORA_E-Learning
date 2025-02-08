import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Teacher } from './entities/teacher.entity';
import { AdminsController, UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SuperAdminSeeder } from '../database/seeders/superadmin.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Teacher]),
  ],
  controllers: [
    UsersController,
    AdminsController,
  ],
  providers: [
    UsersService,
    SuperAdminSeeder,
  ],
  exports: [UsersService],
})
export class UsersModule { }
