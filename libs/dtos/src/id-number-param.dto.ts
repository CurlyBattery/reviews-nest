import { IsNotEmpty, IsNumberString } from 'class-validator';

export class IdNumberParamDto {
  @IsNotEmpty()
  @IsNumberString()
  id: string;
}
