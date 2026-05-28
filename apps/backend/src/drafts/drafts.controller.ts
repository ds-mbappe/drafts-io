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
import { DraftsService } from './drafts.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';

@Controller('drafts')
@UseGuards(JwtGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  async getDrafts(
    @Query('search') search?: string,
    @Query('topic') topic?: string | string[],
    @Query('cursor') cursor?: string,
    @User() user?: JwtPayload,
  ) {
    const topics = topic ? (Array.isArray(topic) ? topic : [topic]) : [];
    return this.draftsService.getDrafts(
      search,
      user.sub,
      { cursor, take: 10 },
      topics,
    );
  }

  @Get('/trending')
  async getTrending(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @User() user?: JwtPayload,
  ) {
    return this.draftsService.getTrending(
      user?.sub,
      limit ? Number(limit) : 10,
      skip ? Number(skip) : 0,
    );
  }

  @Get('/topics')
  async getTopics() {
    return this.draftsService.getTopics();
  }

  @Get('/my_library')
  async getMyLibraryDrafts(
    @Query('search') search?: string,
    @Query('cursor') cursor?: string,
    @User() user?: JwtPayload,
  ) {
    return this.draftsService.getMyLibrary(search, user.sub, {
      cursor,
      take: 10,
    });
  }

  @Get('/following')
  async getDraftsOfPeopleIFollow(
    @Query('search') search?: string,
    @Query('cursor') cursor?: string,
    @User() user?: JwtPayload,
  ) {
    return this.draftsService.getDraftsOfPeopleIFollow(search, user.sub, {
      cursor,
      take: 10,
    });
  }

  @Get('user/:username')
  async getDraftsByUsername(
    @Param('username') username: string,
    @Query('cursor') cursor?: string,
    @User() user?: JwtPayload,
  ) {
    return this.draftsService.getDraftsByUsername(username, user.sub, {
      cursor,
      take: 10,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User() user?: JwtPayload) {
    return this.draftsService.findOneDraft(id, user.sub);
  }

  @Post(':id/toggle_like')
  async toggleLike(@Param('id') documentId: string, @User() user: JwtPayload) {
    return this.draftsService.toggleLike(documentId, user.sub);
  }

  @Put(':id')
  async updateDraft(
    @Param('id') documentId: string,
    @Body() updateData: UpdateDraftDto,
    @User() user?: JwtPayload,
  ) {
    return this.draftsService.updateDraft(documentId, updateData, user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.draftsService.deleteDraft(id);
  }

  @Post()
  async create(
    @Body() createDraftDto: CreateDraftDto,
    @User() user: JwtPayload,
  ) {
    return this.draftsService.createDraft(createDraftDto, user.sub);
  }
}
