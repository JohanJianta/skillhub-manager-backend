import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateInstructorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
