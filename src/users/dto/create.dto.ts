import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDto {
  @IsString()
  @IsNotEmpty({ message: 'user_name is required' })
  user_name: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'is_admin is required' })
  is_admin: boolean;
}
