import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class SearchUsersDto extends PartialType(
  OmitType(CreateUserDto, ['hashPassword']),
) {
  @IsNumber()
  @IsOptional()
  id: number;
}
