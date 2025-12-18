import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { JwtGuard } from 'src/auth/jwt.guard';
import { GlobalSearchService } from './global_search.service';
import { JwtPayload } from 'src/types';

@Controller('global_search')
@UseGuards(JwtGuard)
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  async search(@Query('text') search?: string, @User() user?: JwtPayload) {
    return this.globalSearchService.search(search);
  }
}
