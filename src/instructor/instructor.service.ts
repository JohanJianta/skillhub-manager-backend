import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private repo: Repository<Instructor>,
  ) {}

  async findAll() {
    return this.repo.find({
      order: { id: 'ASC' },
      relations: ['courses'],
    });
  }

  async findOne(id: number) {
    const instructor = await this.repo.findOne({
      where: { id },
      relations: ['courses'],
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with id ${id} not found`);
    }

    return instructor;
  }

  async create(dto: CreateInstructorDto) {
    const existing = await this.repo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Instructor with email ${dto.email} already exists`,
      );
    }

    const instructor = this.repo.create(dto);
    return this.repo.save(instructor);
  }

  async update(id: number, dto: UpdateInstructorDto) {
    const instructor = await this.repo.findOne({
      where: { id },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with id ${id} not found`);
    }

    if (dto.email && dto.email !== instructor.email) {
      const emailExists = await this.repo.findOne({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException(
          `Another instructor with email ${dto.email} already exists`,
        );
      }
    }

    Object.assign(instructor, dto);
    return this.repo.save(instructor);
  }

  async delete(id: number): Promise<void> {
    const instructor = await this.repo.findOne({
      where: { id },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with id ${id} not found`);
    }

    await this.repo.remove(instructor);
    return;
  }
}
