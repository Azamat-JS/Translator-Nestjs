import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { TitleModule } from '../title/title.module';
import { EpisodeModule } from '../episode/episode.module';

@Module({
  controllers: [StreamController],
  imports: [TitleModule, EpisodeModule],
  providers: [StreamService],
})
export class StreamModule {}
