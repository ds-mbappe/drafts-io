import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import { prisma } from 'prisma/client';
import { resetPasswordTemplate } from './templates/reset-password';
import { verifyEmailTemplate } from './templates/verify-email';
import { Transporter } from 'nodemailer';

type EmailType = 'VERIFY' | 'RESET';

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail({
    email,
    userId,
    emailType,
    token,
  }: {
    email: string;
    userId: string;
    emailType: EmailType;
    token: string;
  }) {
    try {
      const now = new Date();
      const expiry = new Date(now.getTime() + 60 * 60 * 1000);

      if (emailType === 'VERIFY') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            verifyToken: token,
            verifyTokenExpiry: expiry,
          },
        });
      } else if (emailType === 'RESET') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: expiry,
          },
        });
      }

      const transport: Transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: process.env.RESEND_USERNAME,
          pass: process.env.RESEND_API_KEY,
        },
      });

      const mailOptions = {
        from: 'Drafts App <no-reply@drafts-io.com>',
        to: email,
        subject:
          emailType === 'VERIFY' ? 'Verify your email' : 'Reset your password',
        html:
          emailType === 'VERIFY'
            ? verifyEmailTemplate(token)
            : resetPasswordTemplate(token, email),
      };

      const response: unknown = await transport.sendMail(mailOptions);

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
