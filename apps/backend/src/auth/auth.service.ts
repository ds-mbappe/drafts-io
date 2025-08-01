import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { prisma } from 'prisma/client';
import { User } from '@prisma/client';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signUp(dto: SignUpDto) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (user) {
        throw new BadRequestException(
          'A user with this email already exists !',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const savedUser = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          username: dto.username,
          firstname: dto.firstname,
          lastname: dto.lastname,
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          firstname: true,
          lastname: true,
          phone: true,
          language: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = await this.signToken(savedUser.id, savedUser.email);

      return { access_token: token, user: savedUser };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async signIn(dto: SignInDto) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      const pwMatches = await bcrypt.compare(dto.password, user.password);
      if (!pwMatches) throw new UnauthorizedException('Invalid password');

      return this.signToken(user.id, user.email, user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          verifyToken: token,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          isVerified: true,
          verifyToken: undefined,
          verifyTokenExpiry: undefined,
        },
      });

      return { message: 'Email verified' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const user = await prisma.user.findFirst({
        omit: {
          verifyToken: false,
          forgotPasswordToken: false,
        },
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found.');
      }

      if (dto.token) {
        const isTokenValid = dto.token === user.forgotPasswordToken;

        if (isTokenValid) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dto.password, salt);

          await prisma.user.update({
            where: {
              id: user?.id,
            },
            data: {
              password: hashedPassword,
              forgotPasswordToken: undefined,
              forgotPasswordTokenExpiry: undefined,
            },
          });

          return { message: 'Pasword reset successfully.' };
        } else {
          throw new BadRequestException('The provided token is invalid.');
        }
      }

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          forgotPasswordToken: user?.verifyToken,
          forgotPasswordTokenExpiry: new Date(),
        },
      });

      await this.emailService.sendEmail({
        email: user.email,
        userId: user.id,
        emailType: 'RESET',
      });

      return { message: 'Reset password email sent successfully' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  private async signToken(userId: string, email: string, user?: User) {
    try {
      const payload = { sub: userId, email };
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const {
        password,
        verifyToken,
        forgotPasswordToken,
        verifyTokenExpiry,
        forgotPasswordTokenExpiry,
        ...rest
      } = user;

      return { access_token: token, user: rest };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
