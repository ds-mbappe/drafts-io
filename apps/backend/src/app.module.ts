import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { DraftsModule } from './drafts/drafts.module';
import { GlobalSearchModule } from './global_search/global_search.module';
import { CloudinaryModule } from './utils/cloudinary.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EmailModule,
    DraftsModule,
    GlobalSearchModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
