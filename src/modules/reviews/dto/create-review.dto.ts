import { Category } from '../../../../generated/prisma';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  text: string;
}
