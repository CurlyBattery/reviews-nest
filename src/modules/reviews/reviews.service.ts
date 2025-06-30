import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsRepository } from './reviews.repository';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SearchReviewsDto } from './dto/search-reviews.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class ReviewsService {
  constructor(
    private repository: ReviewsRepository,
    private readonly filesService: FilesService,
  ) {}

  async createReview(
    dto: CreateReviewDto,
    authorId: number,
    imageBuffer: Buffer,
    filename: string,
  ) {
    const [review] = await this.repository.getReviews({
      where: { title: dto.title },
    });
    if (review) {
      throw new ConflictException('Review already exists');
    }

    const preview = await this.filesService.uploadFile(imageBuffer, filename);

    const createdReview = await this.repository.createReview({
      data: {
        title: dto.title,
        previewId: preview.id,
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

  async search(searchDto: SearchReviewsDto) {
    const where = this.transformQueryToReviewsWhere(searchDto);
    let isWhereUndefined = false;
    let count = 0;
    where.OR.forEach((or) => {
      if (or[`${Object.keys(or)}`] === undefined) {
        isWhereUndefined = true;
        count++;
      }
      if (count !== where.OR.length) {
        isWhereUndefined = false;
      }
    });
    if (isWhereUndefined) {
      return await this.repository.getReviews({
        include: {
          userAndReviews: {
            select: {
              user: true,
            },
          },
          _count: {
            select: {
              likes: {
                where: {
                  hasLiked: true,
                },
              },
              dislikes: {
                where: {
                  hasDisliked: true,
                },
              },
            },
          },
          likes: true,
          dislikes: true,
        },
      });
    }
    return await this.repository.getReviews({
      where,
      include: {
        userAndReviews: {
          select: {
            user: true,
          },
        },
        _count: {
          select: {
            likes: {
              where: {
                hasLiked: true,
              },
            },
            dislikes: {
              where: {
                hasDisliked: true,
              },
            },
          },
        },
        likes: true,
        dislikes: true,
      },
    });
  }

  private transformQueryToReviewsWhere(searchDto: SearchReviewsDto) {
    return {
      OR: [
        { id: searchDto.id! },
        { title: searchDto.title! },
        { category: searchDto.category! },
        { text: searchDto.text! },
        { createdAt: searchDto.createdAt! },
        { updatedAt: searchDto.updatedAt! },
      ],
    };
  }

  async getMyReviews(authorId: number) {
    const reviews = await this.repository.getUserReviews({
      where: {
        authorId,
      },
      select: {
        review: {
          include: {
            userAndReviews: {
              select: {
                user: true,
              },
            },
          },
        },
      },
    });

    return reviews.map((review) => {
      return {
        id: review['review'].id,
        title: review['review'].title,
        category: review['review'].category,
        text: review['review'].text,
        previewId: review['review'].previewId,
        createdAt: review['review'].createdAt,
        updatedAt: review['review'].updatedAt,
        userAndReviews: review['review'].userAndReviews,
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
    const [existsDislike] = await this.repository.getDislikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    console.log(existsDislike);
    if (existsDislike && isActive === true) {
      await this.repository.updateDislike({
        where: {
          id: existsDislike.id,
        },
        data: {
          hasDisliked: !isActive,
        },
      });
    }
    if (existsLike) {
      const updatedLike = await this.repository.updateLike({
        where: {
          id: existsLike.id,
        },
        data: {
          hasLiked: isActive,
        },
      });
      return updatedLike;
    }
    if (!existsLike && !isActive) {
      throw new NotFoundException('Like not found');
    }

    const like = await this.repository.createLike({
      data: {
        reviewId: id,
        userId,
        hasLiked: isActive,
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
    const [existsLike] = await this.repository.getLikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    if (existsLike && isActive === true) {
      await this.repository.updateLike({
        where: {
          id: existsLike.id,
        },
        data: {
          hasLiked: !isActive,
        },
      });
    }
    if (existsDislike) {
      const updatedDislike = await this.repository.updateDislike({
        where: {
          id: existsDislike.id,
        },
        data: {
          hasDisliked: isActive,
        },
      });
      return updatedDislike;
    }
    if (!existsDislike && !isActive) {
      throw new NotFoundException('Dislike not found');
    }

    const dislike = await this.repository.createDislike({
      data: {
        reviewId: id,
        userId,
        hasDisliked: isActive,
      },
    });
    return dislike;
  }
}
