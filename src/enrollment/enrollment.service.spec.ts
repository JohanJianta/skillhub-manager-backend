import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let repo: MockRepo<Enrollment>;

  beforeEach(async () => {
    const mockRepo: MockRepo<Enrollment> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    repo = module.get<Repository<Enrollment>>(
      getRepositoryToken(Enrollment),
    ) as MockRepo<Enrollment>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  // =========================
  // create()
  // =========================
  it('create should create enrollments for one student into multiple courses', async () => {
    const dto: CreateEnrollmentDto = {
      student_id: 1,
      course_ids: [10, 20],
    };

    const created1 = {
      id: 1,
      student_id: 1,
      course_id: 10,
      status: 'active',
    } as Enrollment;

    const created2 = {
      id: 2,
      student_id: 1,
      course_id: 20,
      status: 'active',
    } as Enrollment;

    // For each course_id, no existing enrollment
    repo
      .findOne!.mockResolvedValueOnce(null) // for course 10
      .mockResolvedValueOnce(null); // for course 20

    // create() is called twice
    repo.create!.mockReturnValueOnce(created1).mockReturnValueOnce(created2);

    // save() is called twice
    repo.save!.mockResolvedValueOnce(created1).mockResolvedValueOnce(created2);

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenNthCalledWith(1, {
      where: { student_id: 1, course_id: 10 },
    });
    expect(repo.findOne).toHaveBeenNthCalledWith(2, {
      where: { student_id: 1, course_id: 20 },
    });

    expect(repo.create).toHaveBeenNthCalledWith(1, {
      student_id: 1,
      course_id: 10,
      status: 'active',
    });
    expect(repo.create).toHaveBeenNthCalledWith(2, {
      student_id: 1,
      course_id: 20,
      status: 'active',
    });

    expect(repo.save).toHaveBeenNthCalledWith(1, created1);
    expect(repo.save).toHaveBeenNthCalledWith(2, created2);

    expect(result).toEqual([created1, created2]);
  });

  it('create should throw ConflictException if student is already enrolled in a course', async () => {
    const dto: CreateEnrollmentDto = {
      student_id: 1,
      course_ids: [10, 20],
    };

    const existing = {
      id: 99,
      student_id: 1,
      course_id: 10,
      status: 'active',
    } as Enrollment;

    // First course_id already has enrollment
    repo.findOne!.mockResolvedValueOnce(existing);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  // =========================
  // findByStudent()
  // =========================
  it('findByStudent should return enrollments for a student', async () => {
    const enrollments = [
      {
        id: 1,
        student_id: 1,
        course_id: 10,
      } as Enrollment,
      {
        id: 2,
        student_id: 1,
        course_id: 20,
      } as Enrollment,
    ];

    repo.find!.mockResolvedValue(enrollments);

    const result = await service.findByStudent(1);

    expect(repo.find).toHaveBeenCalledWith({
      where: { student_id: 1 },
      relations: ['course'],
      order: { enrolled_at: 'ASC' },
    });
    expect(result).toEqual(enrollments);
  });

  // =========================
  // findByCourse()
  // =========================
  it('findByCourse should return enrollments for a course', async () => {
    const enrollments = [
      {
        id: 1,
        student_id: 1,
        course_id: 10,
      } as Enrollment,
      {
        id: 2,
        student_id: 2,
        course_id: 10,
      } as Enrollment,
    ];

    repo.find!.mockResolvedValue(enrollments);

    const result = await service.findByCourse(10);

    expect(repo.find).toHaveBeenCalledWith({
      where: { course_id: 10 },
      relations: ['student'],
      order: { enrolled_at: 'ASC' },
    });
    expect(result).toEqual(enrollments);
  });

  // =========================
  // delete()
  // =========================
  it('delete should cancel enrollment and return no content', async () => {
    const existing = {
      id: 1,
      student_id: 1,
      course_id: 10,
      status: 'active',
      cancelled_at: null,
    } as Enrollment;

    repo.findOne!.mockResolvedValueOnce(existing);
    repo.save!.mockResolvedValueOnce({
      ...existing,
      status: 'cancelled',
      cancelled_at: new Date(),
    } as Enrollment);

    const result = await service.delete(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'cancelled',
        cancelled_at: expect.any(Object) as Date,
      }),
    );

    expect(result).toBeUndefined();
  });

  it('delete should throw NotFoundException if enrollment not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });
});
