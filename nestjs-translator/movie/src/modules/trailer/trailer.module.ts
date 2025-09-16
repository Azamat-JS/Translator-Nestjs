import { Module } from '@nestjs/common';
import { TrailerController } from './trailer.controller';
import { TrailerService } from './trailer.service';

@Module({
  controllers: [TrailerController],
  providers: [TrailerService],
})
export class TrailerModule {}
