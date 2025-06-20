import { Role, User } from '../../../../generated/prisma';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: User[`email`];

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  username: User[`username`];

  @IsString()
  @IsNotEmpty()
  hashPassword: User[`hashPassword`];

  @IsEnum(Role)
  @IsOptional()
  role?: User[`role`];
}
