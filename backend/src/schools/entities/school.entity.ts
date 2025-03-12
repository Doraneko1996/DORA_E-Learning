import { Class } from "@/classes/entities/class.entity";
import { User } from "@/users/entities/user.entity";
import { 
    Column, 
    Entity, 
    Index, 
    JoinColumn, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
@Index('IDX_SCHOOL_NAME', ['name'])
@Index('IDX_SCHOOL_PROVINCE', ['province'])
export class School {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'smallint' }) // 1: Tiểu học, 2: THCS
    educationLevel: number;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'varchar', length: 20 })
    district: string;

    @Column({ type: 'varchar', length: 20 })
    province: string;

    @Column({ type: 'integer', default: 0 })
    totalStudents: number;

    @Column({ type: 'date' })
    startDate: Date;

    // // Quan hệ với lớp học
    @OneToMany(() => Class, _class => _class.school)
    classes: Class[];

    // Quản lý chuyên môn
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'academic_manager_id' })
    academicManager: User;

    // Quản lý kỹ thuật
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'technical_manager_id' })
    technicalManager: User;
}
