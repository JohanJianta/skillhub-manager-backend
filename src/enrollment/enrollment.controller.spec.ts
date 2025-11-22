/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { StudentService } from '../student/student.service';
import { CourseService } from '../course/course.service';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let service: EnrollmentService;

  const mockEnrollmentService = {
    createMany: jest.fn(),
    delete: jest.fn(),
  };

  const mockStudentService = {
    findOne: jest.fn(),
  };

  const mockCourseService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        {
          provide: EnrollmentService,
          useValue: mockEnrollmentService,
        },
        {
          provide: StudentService,
          useValue: mockStudentService,
        },
        {
          provide: CourseService,
          useValue: mockCourseService,
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
  it('enrollStudent should create enrollment(s) for student into course(s)', async () => {
    const dto: CreateEnrollmentDto = {
      student_id: 1,
      course_ids: [10, 20],
    };

    const created = [
      { id: 1, student_id: 1, course_id: 10 },
      { id: 2, student_id: 1, course_id: 20 },
    ];

    mockEnrollmentService.createMany.mockResolvedValue(created);

    const response = await controller.enrollStudent(dto);

    expect(service.createMany).toHaveBeenCalledWith(dto);
    expect(response).toEqual(created);
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
