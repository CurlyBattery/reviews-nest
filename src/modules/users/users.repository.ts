import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(params: { data: Prisma.UserCreateInput }): Promise<User> {
    const { data } = params;
    const user = await this.prisma.user.create({ data });
    return user;
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    select?: Prisma.UserSelect;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUncheckedUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({ where, data });
  }

  async deleteUser(params: {
    where: Prisma.UserWhereUniqueInput;
    select?: Prisma.UserSelect;
  }): Promise<User> {
    const { where, select } = params;
    return this.prisma.user.delete({ where, select });
  }

  async transactionFindOneDeleteUploadAvatar(
    userParams: {
      where: Prisma.UserWhereUniqueInput;
      select?: Prisma.UserSelect;
    },
    fileParams: { data: Prisma.FileCreateInput },
  ) {
    const { where, select } = userParams;
    const { data } = fileParams;
    return this.prisma.$transaction(async (transactionalPrisma) => {
      const user = await transactionalPrisma.user.findUnique({ where, select });
      const currentAvatarId = user.avatarId;
      const avatar = await transactionalPrisma.file.create({ data });
      await transactionalPrisma.user.update({
        where,
        data: { avatarId: avatar.id },
      });
      if (currentAvatarId) {
        await transactionalPrisma.file.delete({
          where: {
            id: currentAvatarId,
          },
        });
      }
      return avatar;
    });
  }
}
