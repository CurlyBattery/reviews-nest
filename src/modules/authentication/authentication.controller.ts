import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthenticationGuard } from './guards/local.guard';
import RequestWithUser from './requests/user.request';
import { Response } from 'express';
import JwtAuthenticationGuard from './guards/jwt.guard';
import JwtRefreshGuard from './guards/refresh.guard';
import UserRequest from './requests/user.request';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../../../generated/prisma';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActualUser } from '@app/decorators';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    const { accessToken, jwtExp: maxAgeAccessToken } =
      this.authenticationService.getJwtAccessToken(user.id);
    response.cookie('Authentication', accessToken, {
      maxAge: maxAgeAccessToken,
      httpOnly: true,
      secure: false,
      path: '/',
    });

    const { refreshToken, jwtExp: maxAgeRefreshToken } =
      await this.authenticationService.getJwtRefreshToken(user.id);
    response.cookie('Refresh', refreshToken, {
      maxAge: maxAgeRefreshToken,
      httpOnly: true,
      secure: false,
      path: '/',
    });
    return {
      message: 'success',
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    const { accessToken, jwtExp: maxAgeAccessToken } =
      this.authenticationService.getJwtAccessToken(user.id);
    response.cookie('Authentication', accessToken, {
      maxAge: maxAgeAccessToken,
      httpOnly: true,
      secure: false,
      path: '/',
    });
    const { refreshToken, jwtExp: maxAgeRefreshToken } =
      await this.authenticationService.getJwtRefreshToken(user.id);
    response.cookie('Refresh', refreshToken, {
      maxAge: maxAgeRefreshToken,
      httpOnly: true,
      secure: false,
      path: '/',
    });

    return {
      message: 'success',
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    await this.authenticationService.removeJwtRefreshToken(user.id);
    response.cookie('Authentication', '', {
      maxAge: 0,
      httpOnly: true,
      secure: false,
      path: '/',
    });
    response.cookie('Refresh', '', {
      maxAge: 0,
      httpOnly: true,
      secure: false,
      path: '/',
    });
    return {
      message: 'success',
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@ActualUser() user: UserRequest) {
    return user;
  }

  //TODO: change password
  @UseGuards(JwtAuthenticationGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActualUser() user: User,
  ) {
    return this.authenticationService.changePassword(changePasswordDto, user);
  }

  //TODO: forgot password
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authenticationService.forgotPassword(forgotPasswordDto);
  }

  @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authenticationService.resetPassword(resetPasswordDto, token);
  }
}
