import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { GlobalSearchService } from './global_search.service';

@Controller('global_search')
@UseGuards(JwtGuard)
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  async search(
    @Query('text') text?: string,
    @Query('type') type?: 'users' | 'drafts',
    @Query('skip') skip?: string,
  ) {
    return this.globalSearchService.search(text, type, skip ? Number(skip) : 0);
  }
}
