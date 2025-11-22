import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Type(() => Number)
  instructor_id: number;

  @IsDateString()
  schedule: string;
}
