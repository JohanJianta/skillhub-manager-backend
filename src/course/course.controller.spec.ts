/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

describe('CourseController', () => {
  let controller: CourseController;
  let service: CourseService;

  const mockCourseService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ==============================
  // GET /api/courses
  // ==============================
  it('fetchAllCourses should return all courses', async () => {
    const result = [
      { id: 1, name: 'Course A' },
      { id: 2, name: 'Course B' },
    ];

    mockCourseService.findAll.mockResolvedValue(result);

    const response = await controller.fetchAllCourses();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // GET /api/courses/:id
  // ==============================
  it('fetchCourse should return a single course', async () => {
    const result = {
      id: 1,
      name: 'Course A',
      description: 'Desc',
      instructor_id: 10,
    };

    mockCourseService.findOne.mockResolvedValue(result);

    const response = await controller.fetchCourse(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(response).toEqual(result);
  });

  // ==============================
  // POST /api/courses
  // ==============================
  it('create should create and return a course', async () => {
    const dto: CreateCourseDto = {
      name: 'Course A',
      description: 'Desc',
      instructor_id: 10,
      schedule: '2025-11-22T10:00:00.000Z',
    };

    const created = { id: 1, ...dto };

    mockCourseService.create.mockResolvedValue(created);

    const response = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual(created);
  });

  // ==============================
  // PUT /api/courses/:id
  // ==============================
  it('update should update and return a course', async () => {
    const dto: UpdateCourseDto = {
      name: 'Updated Course',
      description: 'Updated Desc',
      instructor_id: 11,
      schedule: '2025-11-23T10:00:00.000Z',
    };

    const updated = { id: 1, ...dto };

    mockCourseService.update.mockResolvedValue(updated);

    const response = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(response).toEqual(updated);
  });

  // ==============================
  // DELETE /api/courses/:id
  // ==============================
  it('removeCourse should call delete and return no content', async () => {
    mockCourseService.delete.mockResolvedValue(undefined);

    const response = await controller.removeCourse(1);

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(response).toBeUndefined();
  });
});
