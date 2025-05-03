import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { Users, UsersSelect } from './entity/users.select';
import { Scrypt } from '@app/hash';

@Injectable()
export class UsersService {
  constructor(private repository: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    const existsUser = await this.repository.getUsers({
      where: { email: dto.email },
    });
    if (existsUser && existsUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    return await this.repository.createUser({
      data: {
        hashPassword: dto.hashPassword,
        email: dto.email,
        username: dto.username,
        avatar: dto.avatar,
        role: dto.role!,
        permissions: dto.permissions!,
      },
    });
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
    const where = this.transformQueryToWhere(searchDto);
    return await this.repository.getUsers({
      where,
      select: UsersSelect,
    });
  }

  transformQueryToWhere(searchDto: SearchUsersDto) {
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
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getUserById(id: number) {
    const user = await this.repository.getUsers({ where: { id } });
    if (!user || user.length === 0) {
      throw new NotFoundException('User not found');
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

  async updateUser(id: number, dto: UpdateUserDto) {
    const existsUser = await this.repository.getUsers({ where: { id } });
    if (!existsUser || existsUser.length === 0) {
      throw new NotFoundException('User not found');
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
    return updatedUser;
  }

  async delete(id: number): Promise<Users> {
    const existsUser = await this.repository.getUsers({ where: { id } });
    if (!existsUser || existsUser.length === 0) {
      throw new NotFoundException('User not found');
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
