import {
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Patch,
  Query,
  Res,
  Sse,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/jwt.guard';
import { SseJwtGuard } from 'src/auth/sse-jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  // SSE cannot send custom headers — guarded by SseJwtGuard which accepts ?token=
  @Sse('stream')
  @UseGuards(SseJwtGuard)
  stream(
    @User() user: JwtPayload,
    @Res() res: Response,
  ): Observable<MessageEvent> {
    const subject = this.svc.createStream(user.sub);

    this.svc
      .getUnreadCount(user.sub)
      .then((count) => subject.next({ type: 'unread_count', data: { count } }))
      .catch(() => {});

    res.on('close', () => this.svc.removeStream(user.sub, subject));

    return subject
      .asObservable()
      .pipe(
        map(
          (event) => ({ type: event.type, data: event.data }) as MessageEvent,
        ),
      );
  }

  @Get()
  @UseGuards(JwtGuard)
  list(
    @User() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.svc.getForUser(user.sub, cursor, take ? +take : 10);
  }

  @Get('unread-count')
  @UseGuards(JwtGuard)
  async unreadCount(@User() user: JwtPayload) {
    const count = await this.svc.getUnreadCount(user.sub);
    return { count };
  }

  @Get('preferences')
  @UseGuards(JwtGuard)
  getPreferences(@User() user: JwtPayload) {
    return this.svc.getPreferences(user.sub);
  }

  @Patch('preferences')
  @UseGuards(JwtGuard)
  updatePreferences(
    @User() user: JwtPayload,
    @Body()
    body: Partial<{
      notifyOnFollow: boolean;
      notifyOnLike: boolean;
      notifyOnComment: boolean;
    }>,
  ) {
    return this.svc.updatePreferences(user.sub, body);
  }

  @Patch('read-all')
  @UseGuards(JwtGuard)
  markAllRead(@User() user: JwtPayload) {
    return this.svc.markAllRead(user.sub);
  }

  @Patch(':id/read')
  @UseGuards(JwtGuard)
  markRead(@Param('id') id: string, @User() user: JwtPayload) {
    return this.svc.markRead(id, user.sub);
  }

  @Delete()
  @UseGuards(JwtGuard)
  deleteAll(@User() user: JwtPayload) {
    return this.svc.deleteAll(user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteOne(@Param('id') id: string, @User() user: JwtPayload) {
    return this.svc.deleteOne(id, user.sub);
  }
}
