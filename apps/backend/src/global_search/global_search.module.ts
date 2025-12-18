import { Module } from '@nestjs/common';
import { GlobalSearchService } from './global_search.service';
import { GlobalSearchController } from './global_search.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GlobalSearchController],
  providers: [GlobalSearchService],
})
export class GlobalSearchModule {}
