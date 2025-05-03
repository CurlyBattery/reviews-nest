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
    data: Prisma.UserUpdateInput;
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
}
