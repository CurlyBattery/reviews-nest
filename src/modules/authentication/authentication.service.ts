import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Scrypt } from '@app/hash';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../../../generated/prisma';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResetTokenRepository } from './reset-token.repository';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface TokenPayload {
  userId: number;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly resetTokenRepository: ResetTokenRepository,
    private readonly mailService: MailService,
  ) {}

  public async register(registrationData: RegisterDto) {
    const hashPassword = await Scrypt.hash(registrationData.password, 16);
    const createdUser = await this.usersService.createUser({
      ...registrationData,
      hashPassword,
    });
    createdUser.hashPassword = undefined;
    createdUser.currentHashedRefreshToken = undefined;
    createdUser.permissions = undefined;
    createdUser.role = undefined;
    return createdUser;
  }

  public async getAuthenticatedUser(email: string, hashPassword) {
    try {
      const [user] = await this.usersService.getUserByEmail(email);
      await this.verifyPassword(hashPassword, user.hashPassword);
      user.hashPassword = undefined;
      user.currentHashedRefreshToken = undefined;
      user.permissions = undefined;
      user.role = undefined;
      return user;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  private async verifyPassword(plainTextPassword, hashedPassword) {
    const isPasswordMatching = await Scrypt.compare(
      hashedPassword,
      plainTextPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  public getJwtAccessToken(userId: number) {
    const payload: TokenPayload = { userId };
    const maxAge = this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${maxAge / 1000}s`,
      }),
      jwtExp: maxAge,
    };
  }

  public async getJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const maxAge = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${maxAge / 1000}s`,
    });
    await this.usersService.setCurrentRefreshToken(refreshToken, userId);
    return {
      refreshToken: refreshToken,
      jwtExp: maxAge,
    };
  }

  async removeJwtRefreshToken(userId: number) {
    await this.usersService.removeRefreshToken(userId);
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    //TODO: Find the user
    const [findUser] = await this.usersService.getUserById(user['id']);
    //TODO: Compare the old password with the password in DB
    await this.verifyPassword(
      changePasswordDto.oldPassword,
      findUser.hashPassword,
    );

    //TODO: Change user's password (DON'T FORGET TO HASH IT)
    const newHashPassword = await Scrypt.hash(
      changePasswordDto.newPassword,
      16,
    );
    const updatedUser = await this.usersService.updateUser(findUser.id, {
      hashPassword: newHashPassword,
    });
    updatedUser.hashPassword = undefined;
    updatedUser.currentHashedRefreshToken = undefined;
    updatedUser.permissions = undefined;
    updatedUser.role = undefined;
    return updatedUser;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    //TODO: Check that user exists
    const [user] = await this.usersService.getUserByEmail(
      forgotPasswordDto.email,
    );
    //TODO: If user exists, generate password reset link
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    const resetToken = uuidv4();
    await this.resetTokenRepository.createResetToken({
      data: {
        token: resetToken,
        userId: user.id,
        expireDate,
      },
    });
    //TODO: Send the link to the user by email
    await this.mailService.sendPasswordResetEmail(
      forgotPasswordDto.email,
      resetToken,
    );
    return { message: 'success' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, resetToken: string) {
    //TODO: Find a valid token in DB
    const [token] = await this.resetTokenRepository.getResetTokens({
      where: {
        token: resetToken,
        expireDate: {
          gte: new Date(Date.now()),
        },
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }
    //TODO: Change user password
    const newHashPassword = await Scrypt.hash(resetPasswordDto.newPassword, 16);
    const updatedUser = await this.usersService.updateUser(token.userId, {
      hashPassword: newHashPassword,
    });
    updatedUser.hashPassword = undefined;
    updatedUser.currentHashedRefreshToken = undefined;
    updatedUser.permissions = undefined;
    updatedUser.role = undefined;
    return updatedUser;
  }
}
