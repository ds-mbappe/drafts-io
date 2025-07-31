import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { prisma } from 'prisma/client';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signup(dto: SignUpDto) {
    const user = await prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      throw new BadRequestException('A user with this email already exists !');
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
  }

  async signin(dto: SignInDto) {
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
  }

  private async signToken(userId: string, email: string, user?: User) {
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
  }
}
