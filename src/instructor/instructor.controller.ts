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
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Controller('/api/instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get()
  fetchAllInstructors() {
    return this.instructorService.findAll();
  }

  @Get('/:id')
  fetchInstructor(@Param('id') id: number) {
    return this.instructorService.findOne(id);
  }

  @Post()
  addInstructor(@Body() dto: CreateInstructorDto) {
    return this.instructorService.create(dto);
  }

  @Put('/:id')
  updateInstructor(@Param('id') id: number, @Body() dto: UpdateInstructorDto) {
    return this.instructorService.update(id, dto);
  }

  @Delete('/:id')
  @HttpCode(204)
  removeInstructor(@Param('id') id: number) {
    return this.instructorService.delete(id);
  }
}
