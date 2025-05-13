import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, Review, User, UserReview } from 'generated/prisma';

@Injectable()
export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async createReview(params: {
    data: Prisma.ReviewCreateInput;
  }): Promise<Review> {
    const { data } = params;
    const review = await this.prisma.review.create({ data });
    return review;
  }

  async createUserReview(params: {
    data: Prisma.UserReviewUncheckedCreateInput;
  }): Promise<UserReview> {
    const { data } = params;
    const review = await this.prisma.userReview.create({ data });
    return review;
  }

  async getReviews(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ReviewWhereUniqueInput;
    where?: Prisma.ReviewWhereInput;
    orderBy?: Prisma.ReviewOrderByWithRelationInput;
    select?: Prisma.ReviewSelect;
  }): Promise<Review[]> {
    const { skip, take, cursor, where, orderBy, select } = params;

    return this.prisma.review.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async getUserReviews(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserReviewWhereUniqueInput;
    where?: Prisma.UserReviewWhereInput;
    orderBy?: Prisma.UserReviewOrderByWithRelationInput;
    select?: Prisma.UserReviewSelect;
  }): Promise<UserReview[]> {
    const { skip, take, cursor, where, orderBy, select } = params;

    return this.prisma.userReview.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async updateReview(params: {
    where: Prisma.ReviewWhereUniqueInput;
    data: Prisma.ReviewUpdateInput;
  }): Promise<Review> {
    const { where, data } = params;
    return this.prisma.review.update({ where, data });
  }

  async deleteReview(params: {
    where: Prisma.ReviewWhereUniqueInput;
    select?: Prisma.ReviewSelect;
  }): Promise<Review> {
    const { where, select } = params;
    return this.prisma.review.delete({ where, select });
  }
}
