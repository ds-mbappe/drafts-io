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
import { UpdateDraftDto } from './dto/update-draft.dto';

@Controller('drafts')
@UseGuards(JwtGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  async getDrafts(@Query('search') search?: string, @User() user?: JwtPayload) {
    return this.draftsService.getDrafts(search, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user?: JwtPayload) {
    return this.draftsService.findOneDraft(id, user.sub);
  }

  @Post(':documentId/toggle_like')
  toggleLike(
    @Param('documentId') documentId: string,
    @User() user: JwtPayload,
  ) {
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
  remove(@Param('id') id: string) {
    return this.draftsService.deleteDraft(id);
  }

  // @Post()
  // create(@Body() createDraftDto: CreateDraftDto) {
  //   return this.draftsService.create(createDraftDto);
  // }

  // @Get()
  // findAll() {
  //   return this.draftsService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDraftDto: UpdateDraftDto) {
  //   return this.draftsService.update(+id, updateDraftDto);
  // }
}
