import { Module } from '@nestjs/common';
import { GarageController } from './garage.controller';
import { GarageService } from './garage.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    MulterModule.register({
      dest: './uploads', // temporary storage folder
    }),
  ],
  controllers: [GarageController],
  providers: [GarageService],
})
export class GarageModule {}
