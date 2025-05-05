import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
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
import { Permission } from '../../../generated/prisma';
import JwtAuthenticationGuard from '../authentication/guards/jwt.guard';
import PermissionGuard from '../authentication/guards/permissions.guard';
import { ActualUser } from '@app/decorators/user.decorator';
import UserRequest from '../authentication/requests/user.request';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    console.log(user);
    return this.usersService.updateUser(+id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard(Permission.DeleteYourProfile))
  deleteUser(@Param('id') id: number) {
    return this.usersService.delete(id);
  }
}
