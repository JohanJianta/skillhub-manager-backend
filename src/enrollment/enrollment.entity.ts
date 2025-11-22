import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Course } from '../course/course.entity';

@Entity({ name: 'enrollments' })
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  // FK to students
  @Column({ type: 'int', nullable: false })
  student_id: number;

  @ManyToOne(() => Student, (student) => student.enrollments, {
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // FK to courses
  @Column({ type: 'int', nullable: false })
  course_id: number;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    nullable: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrolled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;
}
