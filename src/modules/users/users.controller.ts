import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import JwtAuthenticationGuard from '../authentication/guards/jwt.guard';
import { ActualUser } from '@app/decorators/user.decorator';
import UserRequest from '../authentication/requests/user.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete('avatar')
  @UseGuards(JwtAuthenticationGuard)
  async deleteAvatar(@ActualUser() user: UserRequest) {
    console.log(user);
    return this.usersService.deleteAvatar(user['id']);
  }

  @Get()
  getUsers(@Query() searchDto: SearchUsersDto) {
    return this.usersService.search(searchDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
    @ActualUser() user: UserRequest,
  ) {
    return this.usersService.updateUser(+id, dto, user['id']);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number, @ActualUser() user: UserRequest) {
    return this.usersService.deleteUser(id, user['id']);
  }

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @ActualUser() user: UserRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.usersService.addAvatar(
      user['id'],
      file.buffer,
      file.originalname,
    );
    return { message: 'Avatar successfully upload.' };
  }
}
