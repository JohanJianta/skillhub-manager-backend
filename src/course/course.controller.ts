import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InstructorService } from '../instructor/instructor.service';

@Controller('/api/courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly instructorService: InstructorService,
  ) {}

  @Get()
  fetchAllCourses() {
    return this.courseService.findAll();
  }

  @Get('/:id')
  fetchCourse(@Param('id') id: number) {
    return this.courseService.findOne(id);
  }

  @Post()
  async addCourse(@Body() dto: CreateCourseDto) {
    await this.instructorService.findOne(dto.instructor_id);
    return this.courseService.create(dto);
  }

  @Put('/:id')
  async updateCourse(@Param('id') id: number, @Body() dto: UpdateCourseDto) {
    if (dto.instructor_id) {
      await this.instructorService.findOne(dto.instructor_id);
    }
    return this.courseService.update(id, dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeCourse(@Param('id') id: number) {
    return this.courseService.delete(id);
  }
}
