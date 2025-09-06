import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nMiddleware, I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(I18nMiddleware)
  app.useGlobalPipes(new I18nValidationPipe());

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );
  await app.listen(3000);
}
bootstrap();
