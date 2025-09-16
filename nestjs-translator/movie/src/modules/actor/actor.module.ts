import { Module } from '@nestjs/common';
import { ActorController } from './actor.controller';
import { ActorService } from './actor.service';

@Module({
  controllers: [ActorController],
  providers: [ActorService],
})
export class ActorModule {}
