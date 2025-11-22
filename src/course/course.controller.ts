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

@Controller('/api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  fetchAllCourses() {
    return this.courseService.findAll();
  }

  @Get('/:id')
  fetchCourse(@Param('id') id: number) {
    return this.courseService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Put('/:id')
  update(@Param('id') id: number, @Body() dto: UpdateCourseDto) {
    return this.courseService.update(id, dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeCourse(@Param('id') id: number) {
    return this.courseService.delete(id);
  }
}
