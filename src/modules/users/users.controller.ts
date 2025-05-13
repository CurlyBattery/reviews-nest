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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import JwtAuthenticationGuard from '../authentication/guards/jwt.guard';
import { ActualUser } from '@app/decorators/user.decorator';
import UserRequest from '../authentication/requests/user.request';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthenticationGuard)
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
    return this.usersService.delete(id, user['id']);
  }
}
