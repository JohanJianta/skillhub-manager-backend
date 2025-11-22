import { IsNotEmpty, IsEmail, IsString, IsPhoneNumber } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('ID')
  @IsNotEmpty()
  phone: string;
}
