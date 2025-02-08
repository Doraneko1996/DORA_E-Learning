import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';

@ChildEntity()
export class Teacher extends User {
    // 1: Giáo viên GEMS; 0: Giáo viên trường
    @Column({ nullable: true, default: null })
    gems_employee: boolean;

    // 0: Sau Đại học (Thạc sĩ, Tiến sĩ); 1: Đại học; 2: Cao đẳng; 3: Trung cấp
    @Column({ nullable: true, default: null })
    education_level: number;

    // 1: Bằng liên quan đến tin học; 0: Bằng không liên quan đến tin học
    @Column({ nullable: true, default: null })
    informatic_relation: boolean;

    // 0: Không có NVSP; 1: Có NVSP Tiểu học; 2: Có NVSP THCS; 3: Có NVSP cả 2 cấp học
    @Column({ nullable: true, default: null })
    nvsp: number;

    // 1: Có chứng chỉ IC3; 0: Không có chứng chỉ IC3
    @Column({ nullable: true, default: null })
    ic3_certificate: boolean;

    // 1: Có chứng chỉ ICDL; 0: Không có chứng chỉ ICDL
    @Column({ nullable: true, default: null })
    icdl_certificate: boolean;
}
