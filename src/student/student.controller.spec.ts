/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

describe('StudentController', () => {
  let controller: StudentController;
  let service: StudentService;

  const mockStudentService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        {
          provide: StudentService,
          useValue: mockStudentService,
        },
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    service = module.get<StudentService>(StudentService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ==============================
  // GET /api/students
  // ==============================
  it('fetchAllStudents should return all students', async () => {
    const result = [
      { id: 1, name: 'John', email: 'john@test.com', phone: '123' },
      { id: 2, name: 'Jane', email: 'jane@test.com', phone: '456' },
    ];

    mockStudentService.findAll.mockResolvedValue(result);

    const response = await controller.fetchAllStudents();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // GET /api/students/:id
  // ==============================
  it('fetchStudent should return a single student', async () => {
    const result = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      phone: '123',
    };

    mockStudentService.findOne.mockResolvedValue(result);

    const response = await controller.fetchStudent(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // POST /api/students
  // ==============================
  it('addStudent should create and return a student', async () => {
    const dto: CreateStudentDto = {
      name: 'John',
      email: 'john@test.com',
      phone: '123',
    };

    const created = { id: 1, ...dto };

    mockStudentService.create.mockResolvedValue(created);

    const response = await controller.addStudent(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual(created);
  });

  // ==============================
  // PUT /api/students/:id
  // ==============================
  it('updateStudent should update and return a student', async () => {
    const dto: UpdateStudentDto = {
      name: 'Updated Name',
      email: 'updated@test.com',
      phone: '999',
    };

    const updated = { id: 1, ...dto };

    mockStudentService.update.mockResolvedValue(updated);

    const response = await controller.updateStudent(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(response).toEqual(updated);
  });

  // ==============================
  // DELETE /api/students/:id
  // ==============================
  it('removeStudent should call delete and return no content', async () => {
    mockStudentService.delete.mockResolvedValue(undefined);

    const response = await controller.removeStudent(1);

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(response).toBeUndefined();
  });
});
