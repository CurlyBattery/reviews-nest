import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  Dislike,
  Like,
  Prisma,
  Review,
  User,
  UserReview,
} from 'generated/prisma';

@Injectable()
export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async createReview(params: {
    data: Prisma.ReviewUncheckedCreateInput;
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
    include?: Prisma.ReviewInclude;
  }): Promise<Review[]> {
    const { skip, take, cursor, where, orderBy, select, include } = params;

    if (include) {
      return this.prisma.review.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include,
      });
    } else {
      return this.prisma.review.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        select,
      });
    }
  }

  async getReviewsCount() {
    return this.prisma.review.count();
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

  async createLike(params: {
    data: Prisma.LikeUncheckedCreateInput;
  }): Promise<Like> {
    const { data } = params;
    const like = await this.prisma.like.create({
      data,
    });
    return like;
  }

  async getLikes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LikeWhereUniqueInput;
    where?: Prisma.LikeWhereInput;
    orderBy?: Prisma.LikeOrderByWithRelationInput;
    select?: Prisma.LikeSelect;
  }): Promise<Like[]> {
    const { skip, take, cursor, where, orderBy, select } = params;

    return this.prisma.like.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  // async deleteLike(params: {
  //   where: Prisma.LikeWhereUniqueInput;
  //   select?: Prisma.LikeSelect;
  // }): Promise<Like> {
  //   const { where, select } = params;
  //   return this.prisma.like.delete({ where, select });
  // }
  async updateLike(params: {
    where: Prisma.LikeWhereUniqueInput;
    data: Prisma.LikeUpdateInput;
  }): Promise<Like> {
    const { where, data } = params;
    return this.prisma.like.update({ where, data });
  }

  async createDislike(params: {
    data: Prisma.DislikeUncheckedCreateInput;
  }): Promise<Dislike> {
    const { data } = params;
    const dislike = await this.prisma.dislike.create({
      data,
    });
    return dislike;
  }

  async getDislikes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DislikeWhereUniqueInput;
    where?: Prisma.DislikeWhereInput;
    orderBy?: Prisma.DislikeOrderByWithRelationInput;
    select?: Prisma.DislikeSelect;
  }): Promise<Dislike[]> {
    const { skip, take, cursor, where, orderBy, select } = params;

    return this.prisma.dislike.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async updateDislike(params: {
    where: Prisma.DislikeWhereUniqueInput;
    data: Prisma.DislikeUpdateInput;
  }): Promise<Dislike> {
    const { where, data } = params;
    return this.prisma.dislike.update({ where, data });
  }
  // async deleteDislike(params: {
  //   where: Prisma.DislikeWhereUniqueInput;
  //   select?: Prisma.DislikeSelect;
  // }): Promise<Dislike> {
  //   const { where, select } = params;
  //   return this.prisma.dislike.delete({ where, select });
  // }
}
