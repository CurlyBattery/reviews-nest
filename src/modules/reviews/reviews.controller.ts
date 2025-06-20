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
    @Param('id') reviewId: number,
    @Body() dto: UpdateReviewDto,
    @ActualUser() user,
  ) {
    return this.reviewsService.updateReview(+reviewId, dto, user.id);
  }

  @Delete(':id')
  deleteReview(@Param('id') reviewId: number, @ActualUser() user) {
    return this.reviewsService.deleteReview(+reviewId, user.id);
  }

  @Post(':id/like')
  like(
    @Query('isActive') isActive: boolean,
    @Param('id', ParseIntPipe) id: number,
    @ActualUser() user,
  ) {
    return this.reviewsService.like(id, isActive, user.id);
  }

  @Post(':id/dislike')
  dislike(
    @Query('isActive') isActive: boolean,
    @Param('id', ParseIntPipe) id: number,
    @ActualUser() user,
  ) {
    return this.reviewsService.dislike(id, isActive, user.id);
  }
}
