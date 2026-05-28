import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
