import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import {MicroserviceOptions, Transport} from '@nestjs/microservices'
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options:{
      host: "127.0.0.1",
      port: 8877
    }
  });

  await app.listen();
  Logger.log('Auth service is running on port: 8877')
}
bootstrap();
