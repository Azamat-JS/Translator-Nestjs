import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
     ConfigModule.forRoot({envFilePath:".env", isGlobal:true}),
    ClientsModule.register([
    {
      name: "AUTH-SERVICE",
      transport: Transport.TCP,
      options:{
        host: "127.0.0.1",
        port: 8877
      }
    }
  ])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
