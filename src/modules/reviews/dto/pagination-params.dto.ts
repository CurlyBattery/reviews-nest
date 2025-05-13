import { IsOptional, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationParamsDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(0)
  offset?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  limit?: number;
}
