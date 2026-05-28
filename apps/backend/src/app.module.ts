import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { DraftsModule } from './drafts/drafts.module';
import { GlobalSearchModule } from './global_search/global_search.module';
import { CloudinaryModule } from './utils/cloudinary.module';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';
import { RelationsModule } from './relations/relations.module';
import { AiModule } from './ai/ai.module';
import { TtsModule } from './tts/tts.module';
import { TranslationsModule } from './translations/translations.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { RecentlyReadModule } from './recently-read/recently-read.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EmailModule,
    DraftsModule,
    GlobalSearchModule,
    CloudinaryModule,
    UserModule,
    CommentsModule,
    RelationsModule,
    AiModule,
    TtsModule,
    TranslationsModule,
    BookmarksModule,
    RecentlyReadModule,
    SettingsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
