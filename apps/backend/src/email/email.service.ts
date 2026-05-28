import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from 'prisma/prisma.service';
import { handleHttpError } from 'src/utils/handle-http-error';
import { changeEmailCodeTemplate } from './templates/change-email-code';
import { emailChangedNotificationTemplate } from './templates/email-changed-notification';
import { changePasswordCodeTemplate } from './templates/change-password-code';
import { passwordChangedNotificationTemplate } from './templates/password-changed-notification';
import { accountDeactivatedTemplate } from './templates/account-deactivated';
import { accountDeletedTemplate } from './templates/account-deleted';

type EmailType =
  | 'VERIFY'
  | 'RESET'
  | 'CHANGE_EMAIL_CODE'
  | 'EMAIL_CHANGED'
  | 'CHANGE_PASSWORD_CODE'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_DEACTIVATED'
  | 'ACCOUNT_DELETED';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Drafts App <no-reply@drafts-io.com>';

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async sendEmail({
    email,
    userId,
    emailType,
    token,
    code,
    newEmail,
  }: {
    email: string;
    userId?: string;
    emailType: EmailType;
    token?: string;
    code?: string;
    newEmail?: string;
  }) {
    try {
      const now = new Date();
      const expiry = new Date(now.getTime() + 60 * 60 * 1000);

      // Legacy token-based types — store token on user and send via Resend templates
      if (emailType === 'VERIFY' && userId && token) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { verifyToken: token, verifyTokenExpiry: expiry },
        });
        const verifyURL = `${process.env.FRONTEND_URL}/account/verify-email?token=${token}`;
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Verify your email',
          html: `<p>Click <a href="${verifyURL}">here</a> to verify your email.</p>`,
        });
      }

      if (emailType === 'RESET' && userId && token) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: expiry,
          },
        });
        const resetURL = `${process.env.FRONTEND_URL}/account/reset-password?email=${email}&token=${token}`;
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Reset your password',
          html: `<p>Click <a href="${resetURL}">here</a> to reset your password.</p>`,
        });
      }

      // Code-based settings flows
      if (emailType === 'CHANGE_EMAIL_CODE' && code && newEmail) {
        return resend.emails.send({
          from: FROM,
          to: newEmail,
          subject: 'Confirm your new email address',
          html: changeEmailCodeTemplate(code, newEmail),
        });
      }

      if (emailType === 'EMAIL_CHANGED' && newEmail) {
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your email address was changed',
          html: emailChangedNotificationTemplate(newEmail),
        });
      }

      if (emailType === 'CHANGE_PASSWORD_CODE' && code) {
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Confirm your password change',
          html: changePasswordCodeTemplate(code),
        });
      }

      if (emailType === 'PASSWORD_CHANGED') {
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your password was changed',
          html: passwordChangedNotificationTemplate(),
        });
      }

      if (emailType === 'ACCOUNT_DEACTIVATED') {
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your account has been deactivated',
          html: accountDeactivatedTemplate(),
        });
      }

      if (emailType === 'ACCOUNT_DELETED') {
        return resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your account has been permanently deleted',
          html: accountDeletedTemplate(),
        });
      }
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }
}
