/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Instructor } from '../instructor/instructor.entity';
import { Enrollment } from '../enrollment/enrollment.entity';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // FK column
  @Column({ type: 'int', nullable: false })
  instructor_id: number;

  @ManyToOne(() => Instructor, (instructor) => instructor.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @Column({ type: 'timestamp', nullable: false })
  schedule: Date;

  @Exclude()
  @Column({ default: false })
  is_deleted: boolean;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
