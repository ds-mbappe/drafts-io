import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RelationsService } from './relations.service';
import { JwtGuard } from 'src/auth/jwt.guard';

type FollowBody = {
  followerId?: string;
  followingId?: string;
  isFollowing?: {
    followerId?: string;
    followingId?: string;
  };
};

@Controller('relations')
@UseGuards(JwtGuard)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post('follow')
  async follow(@Body() body: FollowBody) {
    const followerId = body?.isFollowing?.followerId ?? body?.followerId;
    const followingId = body?.isFollowing?.followingId ?? body?.followingId;

    return this.relationsService.follow(followerId, followingId);
  }

  @Delete('unfollow')
  async unfollow(@Body() body: FollowBody) {
    const followerId = body?.isFollowing?.followerId ?? body?.followerId;
    const followingId = body?.isFollowing?.followingId ?? body?.followingId;

    return this.relationsService.unfollow(followerId, followingId);
  }

  @Post('check_follow')
  async checkFollow(@Body() body: FollowBody) {
    const followerId = body?.isFollowing?.followerId ?? body?.followerId;
    const followingId = body?.isFollowing?.followingId ?? body?.followingId;

    return this.relationsService.checkFollow(followerId, followingId);
  }

  @Get(':id/follow_data')
  async getFollowData(@Param('id') id: string) {
    return this.relationsService.getFollowData(id);
  }
}
