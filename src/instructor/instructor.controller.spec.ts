/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

describe('InstructorController', () => {
  let controller: InstructorController;
  let service: InstructorService;

  const mockInstructorService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [
        {
          provide: InstructorService,
          useValue: mockInstructorService,
        },
      ],
    }).compile();

    controller = module.get<InstructorController>(InstructorController);
    service = module.get<InstructorService>(InstructorService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ==============================
  // GET /api/instructor
  // ==============================
  it('fetchAllInstructors should return all instructors', async () => {
    const result = [
      { id: 1, name: 'Inst A', email: 'a@test.com', phone: '111' },
      { id: 2, name: 'Inst B', email: 'b@test.com', phone: '222' },
    ];

    mockInstructorService.findAll.mockResolvedValue(result);

    const response = await controller.fetchAllInstructors();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // GET /api/instructor/:id
  // ==============================
  it('fetchInstructor should return a single instructor', async () => {
    const result = {
      id: 1,
      name: 'Inst A',
      email: 'a@test.com',
      phone: '111',
    };

    mockInstructorService.findOne.mockResolvedValue(result);

    const response = await controller.fetchInstructor(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // POST /api/instructor
  // ==============================
  it('addInstructor should create and return an instructor', async () => {
    // NOTE: you’re reusing CreateCourseDto here, so we follow that
    const dto: CreateInstructorDto = {
      name: 'Inst A',
      email: 'instA@email.com',
      phone: '555-1234',
    } as CreateInstructorDto;

    const created = { id: 1, ...dto };

    mockInstructorService.create.mockResolvedValue(created);

    const response = await controller.addInstructor(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual(created);
  });

  // ==============================
  // PUT /api/instructor/:id
  // ==============================
  it('updateInstructor should update and return an instructor', async () => {
    const dto: UpdateInstructorDto = {
      name: 'Updated Name',
      email: 'updated@test.com',
      phone: '999',
    } as UpdateInstructorDto;

    const updated = { id: 1, ...dto };

    mockInstructorService.update.mockResolvedValue(updated);

    const response = await controller.updateInstructor(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(response).toEqual(updated);
  });

  // ==============================
  // DELETE /api/instructor/:id
  // ==============================
  it('removeInstructor should call delete and return no content', async () => {
    mockInstructorService.delete.mockResolvedValue(undefined);

    const response = await controller.removeInstructor(1);

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(response).toBeUndefined();
  });
});
