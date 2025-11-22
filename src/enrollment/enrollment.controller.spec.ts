/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let service: EnrollmentService;

  const mockEnrollmentService = {
    create: jest.fn(),
    findByStudent: jest.fn(),
    findByCourse: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        {
          provide: EnrollmentService,
          useValue: mockEnrollmentService,
        },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    service = module.get<EnrollmentService>(EnrollmentService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ==============================
  // POST /api/enrollments
  // ==============================
  it('create should create enrollment(s) for student into course(s)', async () => {
    const dto: CreateEnrollmentDto = {
      student_id: 1,
      course_ids: [10, 20],
    };

    const created = [
      { id: 1, student_id: 1, course_id: 10 },
      { id: 2, student_id: 1, course_id: 20 },
    ];

    mockEnrollmentService.create.mockResolvedValue(created);

    const response = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual(created);
  });

  // ==============================
  // GET /api/enrollments/student/:studentId
  // ==============================
  it('fetchByStudent should return enrollments for a student', async () => {
    const result = [
      { id: 1, student_id: 1, course_id: 10 },
      { id: 2, student_id: 1, course_id: 20 },
    ];

    mockEnrollmentService.findByStudent.mockResolvedValue(result);

    const response = await controller.fetchByStudent(1);

    expect(service.findByStudent).toHaveBeenCalledWith(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // GET /api/enrollments/course/:courseId
  // ==============================
  it('fetchByCourse should return enrollments for a course', async () => {
    const result = [
      { id: 1, student_id: 1, course_id: 10 },
      { id: 2, student_id: 2, course_id: 10 },
    ];

    mockEnrollmentService.findByCourse.mockResolvedValue(result);

    const response = await controller.fetchByCourse(10);

    expect(service.findByCourse).toHaveBeenCalledWith(10);
    expect(response).toEqual(result);
  });

  // ==============================
  // DELETE /api/enrollments/:id
  // ==============================
  it('removeEnrollment should call delete and return no content', async () => {
    mockEnrollmentService.delete.mockResolvedValue(undefined);

    const response = await controller.removeEnrollment(1);

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(response).toBeUndefined();
  });
});
