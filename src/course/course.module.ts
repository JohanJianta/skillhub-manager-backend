import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Instructor } from '../instructor/instructor.entity';
import { InstructorService } from '../instructor/instructor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Instructor])],
  controllers: [CourseController],
  providers: [CourseService, InstructorService],
})
export class CourseModule {}
