import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateEnrollmentDto {
  @IsInt()
  @Type(() => Number)
  student_id: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Transform(({ value }: { value: any[] }) => value.map((v) => Number(v)))
  course_ids: number[];
}
