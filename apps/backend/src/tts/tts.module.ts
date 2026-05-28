import { Module } from '@nestjs/common';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/utils/cloudinary.module';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}
