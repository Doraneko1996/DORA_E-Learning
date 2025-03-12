import { User } from './user.entity';
import { Class } from '@/classes/entities/class.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class TeacherProfile {
  @PrimaryGeneratedColumn('identity')
  id: number;

  // Liên kết 1-1 với User
  @OneToOne(() => User, (user) => user.teacherProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 0: Giáo viên trường; 1: Giáo viên GEMS
  @Column({ type: 'boolean', nullable: true, default: null })
  gemsEmployee: boolean;

  // 0: Trung cấp; 1: Cao đẳng; 2: Đại học; 3: Sau Đại học (Thạc sĩ, Tiến sĩ)
  @Column({ type: 'smallint', nullable: true, default: null })
  educationLevel: number;

  // 1: Bằng liên quan đến tin học; 0: Bằng không liên quan đến tin học
  @Column({ type: 'boolean', nullable: true, default: null })
  informaticRelation: boolean;

  // 0: Không có NVSP; 1: Có NVSP Tiểu học; 2: Có NVSP THCS; 3: Có NVSP cả 2 cấp học
  @Column({ type: 'smallint', nullable: true, default: null })
  nvsp: number;

  // 1: Có chứng chỉ IC3; 0: Không có chứng chỉ IC3
  @Column({ type: 'boolean', nullable: true, default: null })
  ic3Certificate: boolean;

  // 1: Có chứng chỉ ICDL; 0: Không có chứng chỉ ICDL
  @Column({ type: 'boolean', nullable: true, default: null })
  icdlCertificate: boolean;

  // Quan hệ với Class (dành cho giáo viên)
  @ManyToMany(() => Class, (_class) => _class.teachers)
  @JoinTable({
    name: 'teacher_classes',
    joinColumn: { name: 'teacher_profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'class_id', referencedColumnName: 'id' },
  })
  classes: Class[];
}
