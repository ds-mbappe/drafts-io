import { Module } from '@nestjs/common';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TranslationsController],
  providers: [TranslationsService],
})
export class TranslationsModule {}
