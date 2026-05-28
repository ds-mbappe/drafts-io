import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

@Controller('bookmarks')
@UseGuards(JwtGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':draftId/toggle')
  async toggle(
    @Param('draftId') draftId: string,
    @User() user: JwtPayload,
  ): Promise<unknown> {
    return this.bookmarksService.toggle(draftId, user.sub);
  }

  @Get()
  async getSaved(@User() user: JwtPayload): Promise<unknown> {
    return this.bookmarksService.getSaved(user.sub);
  }
}
