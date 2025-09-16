import { Module } from '@nestjs/common';
import { SimilarController } from './similar.controller';
import { SimilarService } from './similar.service';
import { TitleModule } from '../title/title.module';

@Module({
  imports: [TitleModule],
  controllers: [SimilarController],
  providers: [SimilarService],
})
export class SimilarModule {}
