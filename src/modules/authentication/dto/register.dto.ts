import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Permission, Role, User } from '../../../../generated/prisma';
import { Match } from '@app/decorators';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: User[`email`];

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  username: User[`username`];

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', {
    message: 'repeat password does not match',
  })
  repeatPassword: string;

  @IsString()
  @IsNotEmpty()
  avatar: User[`avatar`];

  @IsEnum(Role)
  @IsOptional()
  role?: User[`role`];

  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: User[`permissions`];
}
