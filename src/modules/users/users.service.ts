import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { Users, UsersSelect } from './entity/users.select';
import { Scrypt } from '@app/hash';
import { FilesService } from '../files/files.service';
import { UserNotFoundException } from './exception/user-not-found.exception';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private readonly filesService: FilesService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const existsUser = await this.repository.getUsers({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });
    if (existsUser && existsUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    return await this.repository.createUser({
      data: {
        hashPassword: dto.hashPassword,
        email: dto.email,
        username: dto.username,
        role: dto.role!,
      },
    });
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    return await this.repository.transactionFindOneDeleteUploadAvatar(
      {
        where: { id: userId },
      },
      { data: { filename, data: imageBuffer } },
    );
  }

  async deleteAvatar(userId: number) {
    const [existsUser] = await this.repository.getUsers({
      where: { id: userId },
    });
    if (!existsUser) {
      throw new UserNotFoundException();
    }
    if (existsUser?.avatarId) {
      return this.filesService.deleteFile(existsUser?.avatarId);
    }
    throw new BadRequestException('The user does not have an avatar');
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await Scrypt.hash(refreshToken, 10);
    await this.repository.updateUser({
      where: { id: userId },
      data: {
        currentHashedRefreshToken,
      },
    });
  }

  async search(searchDto: SearchUsersDto): Promise<Users[]> {
    const where = this.transformQueryToUsersWhere(searchDto);
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
      return await this.repository.getUsers({
        select: UsersSelect,
      });
    }
    return await this.repository.getUsers({
      where,
      select: UsersSelect,
    });
  }

  private transformQueryToUsersWhere(searchDto: SearchUsersDto) {
    return {
      OR: [
        { id: searchDto.id! },
        { email: searchDto.email! },
        { username: searchDto.username! },
        { role: searchDto.role! },
      ],
    };
  }

  public async getUserByEmail(email: string) {
    const user = await this.repository.getUsers({ where: { email } });
    if (!user || user.length === 0) {
      throw new UserNotFoundException();
    }
    return user;
  }

  public async getUserById(id: number) {
    const user = await this.repository.getUsers({ where: { id } });
    if (!user || user.length === 0) {
      throw new UserNotFoundException();
    }
    return user;
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ) {
    const [user] = await this.repository.getUsers({ where: { id: userId } });

    const isRefreshTokenMatching = await Scrypt.compare(
      user.currentHashedRefreshToken,
      refreshToken,
    );
    if (!isRefreshTokenMatching) {
      throw new BadRequestException('Refresh token not valid');
    }

    return user;
  }

  async removeRefreshToken(userId: number) {
    return this.repository.updateUser({
      where: { id: userId },
      data: {
        currentHashedRefreshToken: null,
      },
    });
  }

  async updateUser(id: number, dto: UpdateUserDto, actualUserId?: number) {
    const [existsUser] = await this.repository.getUsers({ where: { id } });
    if (!existsUser) {
      throw new UserNotFoundException();
    }

    if (actualUserId) {
      if (actualUserId !== existsUser.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    const updatedUser = await this.repository.updateUser({
      where: {
        id,
      },
      data: dto,
    });
    if (!updatedUser) {
      throw new BadRequestException('User failed to update');
    }
    updatedUser.hashPassword = undefined;
    updatedUser.currentHashedRefreshToken = undefined;
    updatedUser.role = undefined;
    return updatedUser;
  }

  async deleteUser(id: number, userId: number): Promise<Users> {
    const [existsUser] = await this.repository.getUsers({ where: { id } });
    if (!existsUser) {
      throw new UserNotFoundException();
    }

    if (userId !== existsUser.id) {
      throw new ForbiddenException('Access denied');
    }

    const deletedUser = await this.repository.deleteUser({
      where: {
        id,
      },
      select: UsersSelect,
    });
    if (!deletedUser) {
      throw new BadRequestException('User failed to delete');
    }
    return deletedUser;
  }
}
