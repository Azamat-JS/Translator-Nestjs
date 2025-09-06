import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GarageModule } from './garage/garage.module';

@Module({
  imports: [GarageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
