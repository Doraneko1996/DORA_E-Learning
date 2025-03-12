import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { Class } from '@/classes/entities/class.entity';
import { User } from '@/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, Class, User]),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}
