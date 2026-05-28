import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

@Controller('comments')
@UseGuards(JwtGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getComments(@Query('draftId') draftId?: string) {
    return this.commentsService.getComments(draftId);
  }

  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    return this.commentsService.getCommentById(id);
  }

  @Post()
  async createComment(
    @Body()
    body: {
      id?: string;
      draftId: string;
      text: string;
      from: number;
      to: number;
    },
    @User() user: JwtPayload,
  ) {
    return this.commentsService.createComment({ ...body, userId: user.sub });
  }

  @Put(':id')
  async updateComment(@Param('id') id: string, @Body() body: { text: string }) {
    return this.commentsService.updateComment(id, body.text);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentsService.deleteComment(id);
  }
}
