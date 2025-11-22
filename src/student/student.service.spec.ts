import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

describe('StudentService', () => {
  let service: StudentService;
  let repo: MockRepo<Student>;

  beforeEach(async () => {
    const mockRepo: MockRepo<Student> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    repo = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    ) as MockRepo<Student>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  // =========================
  // findAll()
  // =========================
  it('findAll should return non-deleted students', async () => {
    const students = [
      { id: 1, name: 'A', is_deleted: true } as Student,
      { id: 2, name: 'B', is_deleted: false } as Student,
    ];

    repo.find!.mockResolvedValue(students);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      where: { is_deleted: false },
      order: { id: 'ASC' },
    });
    expect(result).toEqual(students);
  });

  // =========================
  // findOne()
  // =========================
  it('findOne should return a student when found', async () => {
    const student = { id: 1, name: 'John', is_deleted: false } as Student;

    repo.findOne!.mockResolvedValue(student);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
      relations: ['enrollments'],
    });
    expect(result).toEqual(student);
  });

  it('findOne should throw NotFoundException when student not found', async () => {
    repo.findOne!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  // =========================
  // create()
  // =========================
  it('create should create and return a new student', async () => {
    const dto: CreateStudentDto = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
    };

    const created = { id: 1, ...dto } as Student;

    // No existing with same email
    repo.findOne!.mockResolvedValueOnce(null);

    // repo.create & repo.save
    repo.create!.mockReturnValue(created);
    repo.save!.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: dto.email, is_deleted: false },
    });
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('create should throw ConflictException when email already exists', async () => {
    const dto: CreateStudentDto = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
    };

    const existing = { id: 99, ...dto } as Student;

    repo.findOne!.mockResolvedValueOnce(existing);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  // =========================
  // update()
  // =========================
  it('update should update and return student when exists and email not changed', async () => {
    const existing = {
      id: 1,
      name: 'Old Name',
      email: 'old@test.com',
      phone: '111',
      is_deleted: false,
    } as Student;

    const dto: UpdateStudentDto = {
      name: 'New Name',
      // no email change here
      phone: '999',
    };

    const saved = { ...existing, ...dto } as Student;

    // First findOne by id
    repo.findOne!.mockResolvedValueOnce(existing);

    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should check email uniqueness if email changed', async () => {
    const existing = {
      id: 1,
      name: 'Old Name',
      email: 'old@test.com',
      phone: '111',
      is_deleted: false,
    } as Student;

    const dto: UpdateStudentDto = {
      email: 'new@test.com',
    };

    const saved = { ...existing, ...dto } as Student;

    // First findOne by id
    repo
      .findOne!.mockResolvedValueOnce(existing) // find by id
      .mockResolvedValueOnce(null); // find by new email, no conflict

    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1, is_deleted: false },
    });
    expect(repo.findOne).toHaveBeenNthCalledWith(2, {
      where: { email: dto.email, is_deleted: false },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should throw NotFoundException if student not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(
      service.update(1, { name: 'New Name' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('update should throw ConflictException if new email already used', async () => {
    const existing = {
      id: 1,
      name: 'Old Name',
      email: 'old@test.com',
      phone: '111',
      is_deleted: false,
    } as Student;

    const dto: UpdateStudentDto = {
      email: 'used@test.com',
    };

    const other = {
      id: 2,
      name: 'Other',
      email: 'used@test.com',
      phone: '222',
      is_deleted: false,
    } as Student;

    // First findOne by id
    repo
      .findOne!.mockResolvedValueOnce(existing) // by id
      .mockResolvedValueOnce(other); // by new email -> conflict

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
      name: 'John',
      email: 'john@test.com',
      phone: '123',
      is_deleted: false,
    } as Student;

    const deleted = { ...existing, is_deleted: true } as Student;

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

  it('delete should throw NotFoundException if student not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });
});
