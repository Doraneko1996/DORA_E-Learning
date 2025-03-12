import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { Class } from '@/classes/entities/class.entity';
import {
  AdminsController,
  ManagersController,
  TeachersController,
  UsersController,
} from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TeacherProfile, Class])],
  controllers: [
    UsersController,
    AdminsController,
    ManagersController,
    TeachersController,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
