import { UserRole } from '@/auth/roles/roles.enum';
import { Class } from '@/classes/entities/class.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { TeacherProfile } from './teacher-profile.entity';

// Base User Entity
@Index('IDX_USER_ROLE', ['role'])
@Index('IDX_USER_LASTNAME', ['lastName'])
@Index('IDX_USER_USERNAME', ['userName'])
@Entity()
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ unique: true, type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 60 })
  password: string;

  // 0: Admin; 1: Manager; 2: Teacher; 3: Student
  @Column({
    type: 'smallint',
    default: UserRole.Student,
  })
  role: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  // 0: Nam; 1: Nữ
  @Column({ type: 'smallint', nullable: true, default: null })
  gender: number;

  @Column({ nullable: true, default: null })
  dob: Date;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 254, nullable: true, default: null })
  email: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  district: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  province: string;

  // Quan hệ với Class (dành cho học sinh)
  @Column({ name: 'class_id', nullable: true })
  @Index('IDX_USER_CLASS', { where: 'role = 3' }) // Chỉ index cho học sinh
  classId: number;

  @ManyToOne(() => Class, (_class) => _class.students)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  // Quan hệ với TeacherProfile (dành cho giáo viên)
  @OneToOne(() => TeacherProfile, (teacherProfile) => teacherProfile.user)
  teacherProfile: TeacherProfile;
}
