import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { handleHttpError } from 'src/utils/handle-http-error';
import {
  ConfirmEmailChangeDto,
  ConfirmPasswordChangeDto,
  DeleteAccountDto,
  RequestEmailChangeDto,
  RequestPasswordChangeDto,
  UpdateNotificationPreferencesDto,
  UpdateProfileDto,
} from './dto/settings.dto';

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ── Profile ─────────────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      if (dto.username) {
        const existing = await this.prisma.user.findFirst({
          where: { username: dto.username, NOT: { id: userId } },
        });
        if (existing)
          throw new BadRequestException('Username is already taken.');
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstname: dto.firstname,
          lastname: dto.lastname,
          username: dto.username,
          avatar: dto.avatar,
          language: dto.language,
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          email: true,
          language: true,
        },
      });

      return user;
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async checkUsername(userId: string, username: string) {
    try {
      if (!username?.trim()) return { available: false };
      const existing = await this.prisma.user.findFirst({
        where: { username: username.trim(), NOT: { id: userId } },
      });
      return { available: !existing };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  // ── Change email ─────────────────────────────────────────────────────────────

  async requestEmailChange(userId: string, dto: RequestEmailChangeDto) {
    try {
      const taken = await this.prisma.user.findUnique({
        where: { email: dto.newEmail },
      });
      if (taken)
        throw new BadRequestException('This email address is already in use.');

      const code = generateCode();
      const expiry = new Date(Date.now() + CODE_TTL_MS);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          pendingEmail: dto.newEmail,
          changeEmailCode: code,
          changeEmailCodeExpiry: expiry,
        },
      });

      await this.emailService.sendEmail({
        email: '',
        emailType: 'CHANGE_EMAIL_CODE',
        code,
        newEmail: dto.newEmail,
      });

      return { message: 'Verification code sent to your new email address.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async confirmEmailChange(userId: string, dto: ConfirmEmailChangeDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found.');

      if (
        !user.changeEmailCode ||
        !user.changeEmailCodeExpiry ||
        !user.pendingEmail
      ) {
        throw new BadRequestException('No pending email change found.');
      }
      if (new Date() > user.changeEmailCodeExpiry) {
        throw new BadRequestException(
          'Verification code has expired. Please request a new one.',
        );
      }
      if (user.changeEmailCode !== dto.code.toUpperCase()) {
        throw new BadRequestException('Invalid verification code.');
      }

      const oldEmail = user.email;
      const newEmail: string = user.pendingEmail as string;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: newEmail,
          pendingEmail: null,
          changeEmailCode: null,
          changeEmailCodeExpiry: null,
        },
      });

      // Notify old email
      await this.emailService.sendEmail({
        email: oldEmail,
        emailType: 'EMAIL_CHANGED',
        newEmail,
      });

      return { message: 'Email address updated successfully.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  // ── Change password ──────────────────────────────────────────────────────────

  async requestPasswordChange(userId: string, dto: RequestPasswordChangeDto) {
    try {
      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match.');
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found.');

      // If the user already has a password, validate the current one
      if (user.password) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Current password is required.');
        }
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid)
          throw new UnauthorizedException('Current password is incorrect.');
      }

      const code = generateCode();
      const expiry = new Date(Date.now() + CODE_TTL_MS);

      // Store hashed new password temporarily in the code field (we re-hash on confirm)
      await this.prisma.user.update({
        where: { id: userId },
        data: { changePasswordCode: code, changePasswordCodeExpiry: expiry },
      });

      await this.emailService.sendEmail({
        email: user.email,
        emailType: 'CHANGE_PASSWORD_CODE',
        code,
      });

      return { message: 'Verification code sent to your email address.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async confirmPasswordChange(userId: string, dto: ConfirmPasswordChangeDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found.');

      if (!user.changePasswordCode || !user.changePasswordCodeExpiry) {
        throw new BadRequestException('No pending password change found.');
      }
      if (new Date() > user.changePasswordCodeExpiry) {
        throw new BadRequestException(
          'Verification code has expired. Please request a new one.',
        );
      }
      if (user.changePasswordCode !== dto.code.toUpperCase()) {
        throw new BadRequestException('Invalid verification code.');
      }

      const hashed = await bcrypt.hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashed,
          changePasswordCode: null,
          changePasswordCodeExpiry: null,
        },
      });

      await this.emailService.sendEmail({
        email: user.email,
        emailType: 'PASSWORD_CHANGED',
      });

      return { message: 'Password updated successfully.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  // ── Delete / deactivate account ──────────────────────────────────────────────

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found.');

      // Verify password if account has one
      if (user.password) {
        if (!dto.password)
          throw new BadRequestException(
            'Password is required to delete your account.',
          );
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Incorrect password.');
      }

      if (dto.type === 'deactivate') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { deactivatedAt: new Date() },
        });

        await this.emailService.sendEmail({
          email: user.email,
          emailType: 'ACCOUNT_DEACTIVATED',
        });
        return { message: 'Account deactivated.' };
      }

      // Hard delete — cascades via Prisma relations
      await this.emailService.sendEmail({
        email: user.email,
        emailType: 'ACCOUNT_DELETED',
      });
      await this.prisma.user.delete({ where: { id: userId } });

      return { message: 'Account permanently deleted.' };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  // ── Notification preferences ─────────────────────────────────────────────────

  async getNotificationPreferences(userId: string) {
    try {
      const prefs = await this.prisma.notificationPreferences.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      return prefs;
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    try {
      const prefs = await this.prisma.notificationPreferences.upsert({
        where: { userId },
        create: { userId, ...dto },
        update: dto,
      });
      return prefs;
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  // ── Get current user ─────────────────────────────────────────────────────────

  async getMe(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          language: true,
          isVerified: true,
          createdAt: true,
          password: true,
          deactivatedAt: true,
          accounts: { select: { provider: true } },
        },
      });
      if (!user) throw new NotFoundException('User not found.');

      // Expose whether user has a password without sending the hash
      const { password, ...rest } = user;
      return { ...rest, hasPassword: !!password };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }
}
