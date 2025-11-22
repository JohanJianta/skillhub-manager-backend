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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('/api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  fetchAllStudents() {
    return this.studentService.findAll();
  }

  @Get('/:id')
  fetchStudent(@Param('id') id: number) {
    return this.studentService.findOne(id);
  }

  @Post()
  addStudent(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Put('/:id')
  updateStudent(@Param('id') id: number, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeStudent(@Param('id') id: number) {
    return this.studentService.delete(id);
  }
}
