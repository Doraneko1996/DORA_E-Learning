import { School } from '@/schools/entities/school.entity';
import { TeacherProfile } from '@/users/entities/teacher-profile.entity';
import { User } from '@/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('IDX_CLASS_SCHOOL', ['school'])
@Index('IDX_CLASS_GRADE', ['grade'])
export class Class {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'smallint' }) // Lớp 3-9
  grade: number;

  @ManyToOne(() => School, (school) => school.classes)
  school: School;

  @ManyToMany(() => TeacherProfile, (teacherProfile) => teacherProfile.classes)
  teachers: TeacherProfile[];

  @OneToMany(() => User, (student) => student.class)
  students: User[];
}
