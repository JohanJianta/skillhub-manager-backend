import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('/api/enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.create(dto);
  }

  @Get('/student/:studentId')
  fetchByStudent(@Param('studentId') studentId: number) {
    return this.enrollmentService.findByStudent(studentId);
  }

  @Get('/course/:courseId')
  fetchByCourse(@Param('courseId') courseId: number) {
    return this.enrollmentService.findByCourse(courseId);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeEnrollment(@Param('id') id: number) {
    return this.enrollmentService.delete(id);
  }
}
