import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 8000
  await app.listen(PORT);
  Logger.log('Api gateway is listening to port: ' + PORT)
}
bootstrap();
