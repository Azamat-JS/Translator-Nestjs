import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';

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
    },
    {
      name: "USER-SERVICE",
      transport: Transport.TCP,
      options:{
        host: "127.0.0.1",
        port: 8878
      }
    }
  ])],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
