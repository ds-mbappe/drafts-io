import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

@Controller('translations')
@UseGuards(JwtGuard)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  /** Save (create or update) a translation for the current user. */
  @Post()
  async upsert(
    @Body()
    body: {
      draftId: string;
      language: string;
      content: Record<string, unknown>;
    },
    @User() user: JwtPayload,
  ) {
    return this.translationsService.upsert(
      body.draftId,
      user.sub,
      body.language,
      body.content,
    );
  }

  /** All translations saved by the current user for a draft. */
  @Get()
  async findByDraft(
    @Query('draftId') draftId: string,
    @User() user: JwtPayload,
  ) {
    return this.translationsService.findByDraft(draftId, user.sub);
  }

  /** Single translation for a specific language. */
  @Get(':language')
  async findOne(
    @Query('draftId') draftId: string,
    @Param('language') language: string,
    @User() user: JwtPayload,
  ) {
    return this.translationsService.findOne(draftId, user.sub, language);
  }

  @Delete(':language')
  async delete(
    @Query('draftId') draftId: string,
    @Param('language') language: string,
    @User() user: JwtPayload,
  ) {
    return this.translationsService.delete(draftId, user.sub, language);
  }
}
