import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private repo: Repository<Course>,
  ) {}

  async findAll() {
    return this.repo.find({
      where: { is_deleted: false },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const course = await this.repo.findOne({
      where: { id, is_deleted: false },
      relations: ['instructor', 'enrollments'],
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return course;
  }

  async create(dto: CreateCourseDto) {
    // Check uniqueness: same name + instructor_id
    const existing = await this.repo.findOne({
      where: {
        name: dto.name,
        instructor_id: dto.instructor_id,
        is_deleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Course "${dto.name}" for this instructor already exists`,
      );
    }

    const course = this.repo.create(dto);
    return this.repo.save(course);
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.repo.findOne({
      where: { id, is_deleted: false },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    // If name or instructor_id is changed, check for "duplicate"
    const nextName = dto.name ?? course.name;
    const nextInstructorId = dto.instructor_id ?? course.instructor_id;

    if (
      (dto.name || dto.instructor_id) &&
      (nextName !== course.name || nextInstructorId !== course.instructor_id)
    ) {
      const conflict = await this.repo.findOne({
        where: {
          name: nextName,
          instructor_id: nextInstructorId,
          is_deleted: false,
        },
      });

      if (conflict && conflict.id !== course.id) {
        throw new ConflictException(
          `Another course "${nextName}" for this instructor already exists`,
        );
      }
    }

    Object.assign(course, dto);
    return this.repo.save(course);
  }

  async delete(id: number): Promise<void> {
    const course = await this.repo.findOne({
      where: { id, is_deleted: false },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    course.is_deleted = true;
    await this.repo.save(course);
    return;
  }
}
