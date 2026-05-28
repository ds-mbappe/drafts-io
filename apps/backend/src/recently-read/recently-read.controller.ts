import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RecentlyReadService } from './recently-read.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

@Controller('recently-read')
@UseGuards(JwtGuard)
export class RecentlyReadController {
  constructor(private readonly recentlyReadService: RecentlyReadService) {}

  @Post(':draftId')
  async record(@Param('draftId') draftId: string, @User() user: JwtPayload) {
    return this.recentlyReadService.record(user.sub, draftId);
  }

  @Get()
  async getRecentlyRead(@Query('cursor') cursor?: string, @User() user?: JwtPayload) {
    return this.recentlyReadService.getRecentlyRead(user.sub, cursor);
  }
}
