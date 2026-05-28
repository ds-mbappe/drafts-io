import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SocialAuthDto, SocialProvider } from './dto/social-auth.dto';
import { EmailService } from 'src/email/email.service';
import { JwtPayload } from 'src/types';
import { PrismaService } from 'prisma/prisma.service';
import { handleHttpError } from 'src/utils/handle-http-error';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async signUp(dto: SignUpDto) {
    try {
      const user = await this.prisma.user.findFirst({
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
      const savedUser = await this.prisma.user.create({
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

      const tokens = await this.signToken(savedUser.id, savedUser.email);

      return { ...tokens, user: savedUser };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A user with this email already exists !',
        );
      }
      handleHttpError(error);
    }
  }

  async signIn(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      if (!user.password) {
        throw new UnauthorizedException(
          'This account uses social login. Please sign in with your provider.',
        );
      }
      const pwMatches = await bcrypt.compare(dto.password, user.password);
      if (!pwMatches) throw new UnauthorizedException('Invalid password');

      return this.signToken(user.id, user.email, user);
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          verifyToken: token,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      await this.prisma.user.update({
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
      handleHttpError(error);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      );

      return { access_token: accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async sendResetPasswordEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) throw new NotFoundException('User not found');

      const token = await this.generateResetToken(user.id);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          forgotPasswordToken: token,
          forgotPasswordTokenExpiry: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      await this.emailService.sendEmail({
        email: user.email,
        userId: user.id,
        emailType: 'RESET',
        token,
      });

      return { message: 'Reset email sent.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) throw new NotFoundException('User not found');

      if (dto.token) {
        const isTokenValid = dto.token === user.forgotPasswordToken;

        if (isTokenValid) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dto.password, salt);

          await this.prisma.user.update({
            where: {
              id: user?.id,
            },
            data: {
              password: hashedPassword,
              forgotPasswordToken: undefined,
              forgotPasswordTokenExpiry: undefined,
            },
          });

          return { message: 'Password reset successfully.' };
        } else {
          throw new BadRequestException('The provided token is invalid.');
        }
      }

      // await this.emailService.sendEmail({
      //   email: user.email,
      //   userId: user.id,
      //   emailType: 'RESET',
      // });

      return { message: 'Reset password email sent successfully' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async socialAuth(dto: SocialAuthDto) {
    try {
      const { provider, code, redirectUri, codeVerifier } = dto;
      const providerUser = await this.exchangeCodeForUser(
        provider,
        code,
        redirectUri,
        codeVerifier,
      );

      // Check for an existing linked account
      const existingAccount = await this.prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: providerUser.id,
          },
        },
        include: { user: true },
      });

      if (existingAccount) {
        return this.signToken(
          existingAccount.user.id,
          existingAccount.user.email,
          existingAccount.user,
        );
      }

      // Find or create user by email
      let user = await this.prisma.user.findUnique({
        where: { email: providerUser.email },
      });

      if (!user) {
        const nameParts = (providerUser.name ?? '').split(' ');
        user = await this.prisma.user.create({
          data: {
            email: providerUser.email,
            username: `user_${Date.now()}`,
            firstname: nameParts[0] ?? null,
            lastname: nameParts.slice(1).join(' ') || null,
            avatar: providerUser.avatar ?? null,
            isVerified: true,
          },
        });
      }

      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider,
          providerAccountId: providerUser.id,
          access_token: providerUser.accessToken,
        },
      });

      return this.signToken(user.id, user.email, user);
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  private async exchangeCodeForUser(
    provider: SocialProvider,
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<{
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    accessToken: string;
  }> {
    if (provider === 'google') {
      // Mobile uses the iOS client (no secret); web uses the web client with secret
      const isIosClient = redirectUri.startsWith('com.googleusercontent.apps');
      const clientId = isIosClient
        ? process.env.GOOGLE_IOS_CLIENT_ID
        : process.env.GOOGLE_CLIENT_ID;
      const extraParams = isIosClient
        ? {}
        : { client_secret: process.env.GOOGLE_CLIENT_SECRET };

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
          ...extraParams,
        }),
      });
      const token = (await tokenRes.json()) as any;
      if (token.error) throw new BadRequestException(`Google token error: ${token.error} - ${token.error_description}`);
      const infoRes = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        },
      );
      const info = (await infoRes.json()) as any;
      if (!info.sub) throw new BadRequestException(`Google userinfo error: ${JSON.stringify(info)}`);
      return {
        id: info.sub,
        email: info.email,
        name: info.name,
        avatar: info.picture,
        accessToken: token.access_token,
      };
    }

    if (provider === 'github') {
      const tokenRes = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            code,
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            redirect_uri: redirectUri,
          }),
        },
      );
      const token = (await tokenRes.json()) as any;
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'User-Agent': 'drafts-io',
        },
      });
      const user = (await userRes.json()) as any;

      let email = user.email as string;
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'User-Agent': 'drafts-io',
          },
        });
        const emails = (await emailsRes.json()) as any[];
        email = emails.find((e) => e.primary)?.email ?? '';
      }
      return {
        id: String(user.id),
        email,
        name: user.name ?? user.login,
        avatar: user.avatar_url,
        accessToken: token.access_token,
      };
    }

    if (provider === 'facebook') {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      });
      const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?${params}`,
      );
      const token = (await tokenRes.json()) as any;
      const userRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token.access_token}`,
      );
      const user = (await userRes.json()) as any;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.picture?.data?.url,
        accessToken: token.access_token,
      };
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  private async signToken(userId: string, email: string, user?: User) {
    try {
      const payload = { sub: userId, email };

      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      if (!user) {
        return {
          access_token: token,
          refresh_token: refreshToken,
        };
      }

      const {
        password,
        verifyToken,
        forgotPasswordToken,
        verifyTokenExpiry,
        forgotPasswordTokenExpiry,
        ...rest
      } = user;

      return {
        user: rest,
        access_token: token,
        refresh_token: refreshToken,
      };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  private async generateResetToken(userId: string): Promise<string> {
    const payload = { sub: userId, purpose: 'reset_password' };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return token;
  }
}
