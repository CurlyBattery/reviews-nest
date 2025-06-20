import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class FilesRepository {
  constructor(private prisma: PrismaService) {}

  async createFile(params: { data: Prisma.FileCreateInput }) {
    const { data } = params;
    const file = await this.prisma.file.create({ data });
    return file;
  }

  async getFiles(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.FileWhereUniqueInput;
    where?: Prisma.FileWhereInput;
    orderBy?: Prisma.FileOrderByWithRelationInput;
    select?: Prisma.FileSelect;
  }) {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.file.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async deleteFile(params: {
    where: Prisma.FileWhereUniqueInput;
    select?: Prisma.FileSelect;
  }) {
    const { where, select } = params;
    return this.prisma.file.delete({ where, select });
  }
}
