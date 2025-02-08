import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_name: string;

    @Column()
    password: string;

    // 0: Admin; 1: Manager; 2: Teacher; 3: Student
    @Column()
    role: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    // 0: Nam; 1: Nữ
    @Column({ nullable: true, default: null })
    gender: number;

    @Column()
    dob: Date;

    @Column({ nullable: true, default: null })
    phone_number: string;

    @Column({ nullable: true, default: null })
    email: string;

    @Column({ nullable: true, default: null })
    refresh_token: string;

    // 1: Đang hoạt động; 0: Ngưng hoạt động
    @Column({ default: 1 })
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true, default: null })
    address: string;

    @Column({ nullable: true, default: null })
    district: string;

    @Column({ nullable: true, default: null })
    province: string;
}
