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
import { SearchReviewsDto } from './dto/search-reviews.dto';
import { Reviews, ReviewsSelect } from './entity/review.select';
import { UsersSelect } from '../users/entity/users.select';
import { SearchUsersDto } from '../users/dto/search-users.dto';
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
        select: ReviewsSelect,
      });
    }
    return await this.repository.getReviews({
      where,
      select: ReviewsSelect,
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
        review: true,
      },
    });

    return reviews.map((review) => {
      return {
        id: review['review'].id,
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
    const [existsDislike] = await this.repository.getDislikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    console.log(existsDislike);
    if (existsDislike) {
      await this.repository.deleteDislike({
        where: {
          id: existsDislike.id,
        },
      });
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
    const [existsLike] = await this.repository.getLikes({
      where: {
        AND: [{ userId }, { reviewId: id }],
      },
    });
    if (existsLike) {
      await this.repository.deleteLike({
        where: {
          id: existsLike.id,
        },
      });
    }
    const dislike = await this.repository.createDislike({
      data: {
        reviewId: id,
        userId,
      },
    });
    return dislike;
  }

  // async getReviews({ limit = 10, offset = 0 }: PaginationParamsDto) {
  //   const reviews = await this.repository.getReviews({
  //     take: limit,
  //     skip: offset,
  //     include: {
  //       likes: true,
  //       dislikes: true,
  //     },
  //   });
  //   const total = await this.repository.getReviewsCount();
  //   return {
  //     data: reviews,
  //     total,
  //     limit,
  //     offset,
  //     nextPage: total > offset ? offset + limit : null,
  //   };
  // }
}
