import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import JwtAuthenticationGuard from '../authentication/guards/jwt.guard';
import { ActualUser } from '@app/decorators';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SearchReviewsDto } from './dto/search-reviews.dto';
import { IdNumberParamDto } from '@app/dtos';

@UseGuards(JwtAuthenticationGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  createReview(@Body() createReviewDto: CreateReviewDto, @ActualUser() user) {
    return this.reviewsService.createReview(createReviewDto, user.id);
  }

  @Get()
  getReviews(@Query() searchDto: SearchReviewsDto) {
    return this.reviewsService.search(searchDto);
  }

  @Get('my')
  getMyReviews(@ActualUser() user) {
    return this.reviewsService.getMyReviews(user.id);
  }

  @Patch(':id')
  updateReview(
    @Param() { id: reviewId }: IdNumberParamDto,
    @Body() dto: UpdateReviewDto,
    @ActualUser() user,
  ) {
    return this.reviewsService.updateReview(Number(reviewId), dto, user.id);
  }

  @Delete(':id')
  deleteReview(
    @Param() { id: reviewId }: IdNumberParamDto,
    @ActualUser() user,
  ) {
    return this.reviewsService.deleteReview(Number(reviewId), user.id);
  }

  @Post(':id/like')
  like(
    @Query('isActive') isActive: boolean,
    @Param() { id }: IdNumberParamDto,
    @ActualUser() user,
  ) {
    return this.reviewsService.like(Number(id), isActive, user.id);
  }

  @Post(':id/dislike')
  dislike(
    @Query('isActive') isActive: boolean,
    @Param() { id }: IdNumberParamDto,
    @ActualUser() user,
  ) {
    return this.reviewsService.dislike(Number(id), isActive, user.id);
  }
}
