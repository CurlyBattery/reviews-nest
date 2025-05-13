import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsRepository } from './reviews.repository';
import { PaginationParamsDto } from './dto/pagination-params.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private repository: ReviewsRepository) {}

  async createReview(dto: CreateReviewDto, authorId) {
    const [review] = await this.repository.getReviews({
      where: { title: dto.title },
    });
    if (review) {
      throw new ConflictException('Review already exists');
    }

    const createdReview = await this.repository.createReview({
      data: {
        title: dto.title,
        preview: dto.preview,
        category: dto.category,
        text: dto.text,
      },
    });
    await this.repository.createUserReview({
      data: {
        authorId,
        reviewId: createdReview.id,
      },
    });
    return createdReview;
  }

  async getReviews({ limit, offset, startingId }: PaginationParamsDto) {
    return this.repository.getReviews({
      take: limit,
      skip: offset,
      cursor: {
        id: startingId ?? 1,
      },
    });
  }

  async getMyReviews(authorId: number) {
    const reviews = await this.repository.getUserReviews({
      where: {
        authorId,
      },
      select: {
        review: true,
      },
    });

    return reviews.map((review) => {
      return {
        title: review['review'].title,
        category: review['review'].category,
        text: review['review'].text,
        preview: review['review'].preview,
      };
    });
  }

  async updateReview(reviewId: number, dto: UpdateReviewDto, authorId: number) {
    const [authorReview] = await this.repository.getUserReviews({
      where: {
        AND: [{ authorId }, { reviewId }],
      },
    });
    if (!authorReview) {
      throw new ForbiddenException('Access denied');
    }

    const [existsReview] = await this.repository.getReviews({
      where: { id: reviewId },
    });
    if (!existsReview) {
      throw new NotFoundException('Review not found');
    }
    const updatedReview = await this.repository.updateReview({
      where: { id: reviewId },
      data: dto,
    });
    if (!updatedReview) {
      throw new BadRequestException('Review failed');
    }
    return updatedReview;
  }

  async deleteReview(reviewId: number, authorId: number) {
    const [authorReview] = await this.repository.getUserReviews({
      where: {
        AND: [{ authorId }, { reviewId }],
      },
    });
    if (!authorReview) {
      throw new ForbiddenException('Access denied');
    }

    const [existsReview] = await this.repository.getReviews({
      where: { id: reviewId },
    });
    if (!existsReview) {
      throw new NotFoundException('Review not found');
    }

    const deletedReview = await this.repository.deleteReview({
      where: { id: reviewId },
    });
    if (!deletedReview) {
      throw new BadRequestException('Review failed');
    }
    return deletedReview;
  }

  async like(id: number, isActive: boolean, userId: number) {
    const [existsReview] = await this.repository.getReviews({
      where: { id },
    });
    if (!existsReview) {
      throw new NotFoundException('Review not found');
    }
    const [existsLike] = await this.repository.getLikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    if (existsLike && isActive) {
      throw new ConflictException('Like already given');
    }
    if (existsLike && !isActive) {
      const deletedLike = await this.repository.deleteLike({
        where: {
          id: existsLike.id,
        },
      });
      return deletedLike;
    }
    if (!existsLike && !isActive) {
      throw new NotFoundException('Like not found');
    }
    const like = await this.repository.createLike({
      data: {
        reviewId: id,
        userId,
      },
    });
    return like;
  }

  async dislike(id: number, isActive: boolean, userId: number) {
    const [existsReview] = await this.repository.getReviews({
      where: { id },
    });
    if (!existsReview) {
      throw new NotFoundException('Review not found');
    }
    const [existsDislike] = await this.repository.getDislikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    if (existsDislike && isActive) {
      throw new ConflictException('Dislike already given');
    }
    if (existsDislike && !isActive) {
      const deletedDislike = await this.repository.deleteDislike({
        where: {
          id: existsDislike.id,
        },
      });
      return deletedDislike;
    }
    if (!existsDislike && !isActive) {
      throw new NotFoundException('Dislike not found');
    }
    const dislike = await this.repository.createDislike({
      data: {
        reviewId: id,
        userId,
      },
    });
    return dislike;
  }
}
