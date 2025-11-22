import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { Instructor } from './instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

describe('InstructorService', () => {
  let service: InstructorService;
  let repo: MockRepo<Instructor>;

  beforeEach(async () => {
    const mockRepo: MockRepo<Instructor> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorService,
        {
          provide: getRepositoryToken(Instructor),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<InstructorService>(InstructorService);
    repo = module.get<Repository<Instructor>>(
      getRepositoryToken(Instructor),
    ) as MockRepo<Instructor>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  // =========================
  // findAll()
  // =========================
  it('findAll should return all instructors with courses', async () => {
    const instructors = [
      { id: 1, name: 'A' } as Instructor,
      { id: 2, name: 'B' } as Instructor,
    ];

    repo.find!.mockResolvedValue(instructors);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
      relations: ['courses'],
    });
    expect(result).toEqual(instructors);
  });

  // =========================
  // findOne()
  // =========================
  it('findOne should return an instructor when found', async () => {
    const instructor = {
      id: 1,
      name: 'John',
    } as Instructor;

    repo.findOne!.mockResolvedValue(instructor);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['courses'],
    });
    expect(result).toEqual(instructor);
  });

  it('findOne should throw NotFoundException when instructor not found', async () => {
    repo.findOne!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  // =========================
  // create()
  // =========================
  it('create should create and return a new instructor', async () => {
    const dto: CreateInstructorDto = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
    };

    const created = { id: 1, ...dto } as Instructor;

    // No existing with same email
    repo.findOne!.mockResolvedValueOnce(null);

    repo.create!.mockReturnValue(created);
    repo.save!.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('create should throw ConflictException when email already exists', async () => {
    const dto: CreateInstructorDto = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
    };

    const existing = { id: 99, ...dto } as Instructor;

    repo.findOne!.mockResolvedValueOnce(existing);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  // =========================
  // update()
  // =========================
  it('update should update and return instructor when exists and email not changed', async () => {
    const existing = {
      id: 1,
      name: 'Old Name',
      email: 'old@test.com',
      phone: '111',
    } as Instructor;

    const dto: UpdateInstructorDto = {
      name: 'New Name',
      phone: '999',
      // email not changed
    };

    const saved = { ...existing, ...dto } as Instructor;

    repo.findOne!.mockResolvedValueOnce(existing);
    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should check email uniqueness if email changed and no conflict', async () => {
    const existing = {
      id: 1,
      name: 'Old Name',
      email: 'old@test.com',
      phone: '111',
    } as Instructor;

    const dto: UpdateInstructorDto = {
      email: 'new@test.com',
    };

    const saved = { ...existing, ...dto } as Instructor;

    repo
      .findOne!.mockResolvedValueOnce(existing) // by id
      .mockResolvedValueOnce(null); // by new email -> no conflict

    repo.save!.mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(repo.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
    });
    expect(repo.findOne).toHaveBeenNthCalledWith(2, {
      where: { email: dto.email },
    });
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('update should throw NotFoundException if instructor not found', async () => {
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
    } as Instructor;

    const dto: UpdateInstructorDto = {
      email: 'used@test.com',
    };

    const other = {
      id: 2,
      name: 'Other',
      email: 'used@test.com',
      phone: '222',
    } as Instructor;

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
  it('delete should remove instructor and return no content', async () => {
    const existing = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      phone: '123',
    } as Instructor;

    repo.findOne!.mockResolvedValueOnce(existing);
    repo.remove!.mockResolvedValueOnce(existing);

    const result = await service.delete(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(repo.remove).toHaveBeenCalledWith(existing);
    expect(result).toBeUndefined();
  });

  it('delete should throw NotFoundException if instructor not found', async () => {
    repo.findOne!.mockResolvedValueOnce(null);

    await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.remove).not.toHaveBeenCalled();
  });
});
