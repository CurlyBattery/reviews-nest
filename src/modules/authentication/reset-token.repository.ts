import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, ResetToken, User } from '../../../generated/prisma';

@Injectable()
export class ResetTokenRepository {
  constructor(private prisma: PrismaService) {}

  async createResetToken(params: {
    data: { userId: number; token: string; expireDate: Date };
  }): Promise<ResetToken> {
    const { data } = params;
    const resetToken = await this.prisma.resetToken.create({ data });
    return resetToken;
  }

  async getResetTokens(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ResetTokenWhereUniqueInput;
    where?: Prisma.ResetTokenWhereInput;
    orderBy?: Prisma.ResetTokenOrderByWithRelationInput;
    select?: Prisma.ResetTokenSelect;
  }): Promise<ResetToken[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.resetToken.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }
}
