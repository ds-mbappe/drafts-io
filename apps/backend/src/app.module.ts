import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { DraftsModule } from './drafts/drafts.module';

@Module({
  imports: [AuthModule, PrismaModule, EmailModule, DraftsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
