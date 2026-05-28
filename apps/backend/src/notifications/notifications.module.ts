import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from 'src/auth/auth.module';
import { SseJwtGuard } from 'src/auth/sse-jwt.guard';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SseJwtGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
