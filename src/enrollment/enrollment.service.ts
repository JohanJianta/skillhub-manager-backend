import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private repo: Repository<Enrollment>,
  ) {}

  async createMany(dto: CreateEnrollmentDto) {
    const { student_id, course_ids } = dto;

    const created: Enrollment[] = [];

    for (const courseId of course_ids) {
      // Prevent duplicate enrollment for same student + course
      const existing = await this.repo.findOne({
        where: {
          student_id,
          course_id: courseId,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Student ${student_id} is already enrolled in course ${courseId}`,
        );
      }

      const enrollment = this.repo.create({
        student_id,
        course_id: courseId,
        status: 'active',
      });

      const saved = await this.repo.save(enrollment);
      created.push(saved);
    }

    return created;
  }

  async delete(id: number): Promise<void> {
    const enrollment = await this.repo.findOne({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    enrollment.status = 'cancelled';
    await this.repo.save(enrollment);
    return;
  }
}
