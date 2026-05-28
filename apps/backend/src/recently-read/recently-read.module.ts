import { Module } from '@nestjs/common';
import { RecentlyReadController } from './recently-read.controller';
import { RecentlyReadService } from './recently-read.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RecentlyReadController],
  providers: [RecentlyReadService],
})
export class RecentlyReadModule {}
