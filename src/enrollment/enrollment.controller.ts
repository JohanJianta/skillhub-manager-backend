import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { CourseService } from '../course/course.service';
import { StudentService } from '../student/student.service';

@Controller('/api/enrollments')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly studentService: StudentService,
    private readonly courseService: CourseService,
  ) {}

  @Post()
  async enrollStudent(@Body() dto: CreateEnrollmentDto) {
    await this.studentService.findOne(dto.student_id);
    for (const courseId of dto.course_ids) {
      await this.courseService.findOne(courseId);
    }
    return this.enrollmentService.createMany(dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeEnrollment(@Param('id') id: number) {
    return this.enrollmentService.delete(id);
  }
}
