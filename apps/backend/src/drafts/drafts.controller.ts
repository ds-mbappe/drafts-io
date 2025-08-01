import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

@Controller('drafts')
@UseGuards(JwtGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  async getDrafts(@Query('search') search?: string, @User() user?: JwtPayload) {
    try {
      const drafts = await this.draftsService.getDrafts(search, user.sub);
      return { drafts };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error retrieving drafts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Post()
  // create(@Body() createDraftDto: CreateDraftDto) {
  //   return this.draftsService.create(createDraftDto);
  // }

  // @Get()
  // findAll() {
  //   return this.draftsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.draftsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDraftDto: UpdateDraftDto) {
  //   return this.draftsService.update(+id, updateDraftDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.draftsService.remove(+id);
  // }
}
