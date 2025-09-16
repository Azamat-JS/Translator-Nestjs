import { Module } from '@nestjs/common';
import { TitleController } from './title.controller';
import { TitleService } from './title.service';
import { EpisodeModule } from '../episode/episode.module';
import { ShareController } from './share.controller';

@Module({
  controllers: [TitleController, ShareController],
  imports: [EpisodeModule],
  providers: [TitleService],
  exports: [TitleService],
})
export class TitleModule {}
