import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from 'src/auth/auth.module';
import { DraftsModule } from 'src/drafts/drafts.module';
import { ContentModule } from 'src/content/content.module';

@Module({
  imports: [AuthModule, DraftsModule, ContentModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
