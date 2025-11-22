import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

describe('CourseService', () => {
  let service: CourseService;
  let repo: MockRepo<Course>;

  beforeEach(async () => {
    const mockRepo: MockRepo<Course> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    repo = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    ) as MockRepo<Course>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  // =========================
  // findAll()
  // =========================
  it('findAll should return non-deleted courses', async () => {
    const courses = [
      { id: 1, name: 'A', is_deleted: false } as Course,
      { id: 2, name: 'B', is_deleted: false } as Course,
    ];

    repo.find!.mockResolvedValue(courses);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      where: { is_deleted: false },
      order: { id: 'ASC' },
    });
    expect(result).toEqual(courses);
  });

  // =========================
  // findOne()
  // =========================
  it('findOne should return a course when found', async () => {
    const course = {
      id: 1,
      name: 'Course A',
      is_deleted: false,
    } as Course;

    repo.findOne!.mockResolvedValue(course);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
      relations: ['instructor', 'enrollments'],
    });
    expect(result).toEqual(course);
  });

  it('findOne should throw NotFoundException when course not found', async () => {
    repo.findOne!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  // =========================
  // create()
  // =========================
  it('create should create and return a new course', async () => {
    const dto: CreateCourseDto = {
      name: 'Course A',
      description: 'Desc',
      instructor_id: 10,
      schedule: '2025-11-22T10:00:00.000Z',
    };

    const created = { id: 1, ...dto } as unknown as Course;

    // No existing with same name + instructor
    repo.findOne!.mockResolvedValueOnce(null);

    repo.create!.mockReturnValue(created);
    repo.save!.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        name: dto.name,
        instructor_id: dto.instructor_id,
        is_deleted: false,
      },
    });
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('create should throw ConflictException when same course for instructor already exists', async () => {
    const dto: CreateCourseDto = {
      name: 'Course A',
      description: 'Desc',
      instructor_id: 10,
      schedule: '2025-11-22T10:00:00.000Z',
    };

    const existing = { id: 99, ...dto, is_deleted: false } as unknown as Course;

    repo.findOne!.mockResolvedValueOnce(existing);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  // =========================
  // update()
  // =========================
  it('update should update and return course when exists and name/instructor not changed', async () => {
    const existing = {
      id: 1,
      name: 'Course A',
      description: 'Old Desc',
      instructor_id: 10,
      schedule: new Date('2025-11-22T10:00:00.000Z'),
      is_deleted: false,
    } as Course;

    const dto: UpdateCourseDto = {
      description: 'New Desc',
      schedule: '2025-11-23T10:00:00.000Z',
    };

    const saved = { ...existing, ...dto } as Course;

    repo.findOne!.mockResolvedValueOnce(existing);
    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should check uniqueness if name or instructor_id changed and no conflict', async () => {
    const existing = {
      id: 1,
      name: 'Course A',
      description: 'Old Desc',
      instructor_id: 10,
      schedule: new Date('2025-11-22T10:00:00.000Z'),
      is_deleted: false,
    } as Course;

    const dto: UpdateCourseDto = {
      name: 'New Course',
      instructor_id: 11,
    };

    const saved = { ...existing, ...dto } as Course;

    repo
      .findOne!.mockResolvedValueOnce(existing) // find by id
      .mockResolvedValueOnce(null); // find by name+instructor -> no conflict

    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1, is_deleted: false },
    });
    expect(repo.findOne).toHaveBeenNthCalledWith(2, {
      where: {
        name: dto.name ?? existing.name,
        instructor_id: dto.instructor_id ?? existing.instructor_id,
        is_deleted: false,
      },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should throw NotFoundException if course not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(
      service.update(1, { name: 'New Course' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('update should throw ConflictException if new name+instructor combination already used', async () => {
    const existing = {
      id: 1,
      name: 'Course A',
      description: 'Old Desc',
      instructor_id: 10,
      schedule: new Date('2025-11-22T10:00:00.000Z'),
      is_deleted: false,
    } as Course;

    const dto: UpdateCourseDto = {
      name: 'Used Course',
      instructor_id: 20,
    };

    const other = {
      id: 2,
      name: 'Used Course',
      instructor_id: 20,
      description: 'Other',
      is_deleted: false,
    } as Course;

    repo
      .findOne!.mockResolvedValueOnce(existing) // by id
      .mockResolvedValueOnce(other); // by name+instructor -> conflict

    await expect(service.update(1, dto)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(repo.save).not.toHaveBeenCalled();
  });

  // =========================
  // delete()
  // =========================
  it('delete should soft delete with no content returned', async () => {
    const existing = {
      id: 1,
      name: 'Course A',
      instructor_id: 10,
      is_deleted: false,
    } as Course;

    const deleted = { ...existing, is_deleted: true } as Course;

    repo.findOne!.mockResolvedValueOnce(existing);
    repo.save!.mockResolvedValue(deleted);

    const result = await service.delete(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
    });
    expect(repo.save).toHaveBeenCalledWith({
      ...existing,
      is_deleted: true,
    });
    expect(result).toBeUndefined();
  });

  it('delete should throw NotFoundException if course not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });
});
