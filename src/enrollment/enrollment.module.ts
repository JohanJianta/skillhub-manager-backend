import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { Student } from '../student/student.entity';
import { StudentService } from '../student/student.service';
import { Course } from '../course/course.entity';
import { CourseService } from '../course/course.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Student, Course])],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, StudentService, CourseService],
})
export class EnrollmentModule {}
