import { NestFactory } from '@nestjs/core';
import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MovieModule } from './movie.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HeaderInterceptor } from './common/interceptors/header.interceptor';
import { HttpExceptionFilter } from './common/exception/global-exception.filter';
import {
  I18nMiddleware,
  I18nService,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import { setI18n } from '@app/helpers/translation.helper';

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Movie API')
    .setDescription('The Movie API description')
    .setVersion('1.0')
    .addServer('http://127.0.0.1:3000', 'Local server')
    .addServer('https://dev.megafilm.uz', 'Development server')
    .addServer('https://megafilm.uz/api', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // <-- bu nom muhim
    )
    .build();
  // Generate the document once
  const document = SwaggerModule.createDocument(app, config);

  // Pass the document directly, no function
  SwaggerModule.setup(`${process.env.API_PREFIX ?? ''}/docs`, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(MovieModule);
  app.use(I18nMiddleware);
  const i18n = app.get<I18nService<Record<string, unknown>>>(I18nService);
  setI18n(i18n);
  app.setGlobalPrefix(process.env.API_PREFIX ?? '');
  app.enableCors({ origin: '*' });
  configureSwagger(app);
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new HeaderInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        const errors = {};
        let message = '';
        validationErrors.forEach((error) => {
          const constraints = error.constraints;
          if (constraints) {
            Object.keys(constraints).forEach(() => {
              errors[error.property] = Object.keys(constraints).map(
                (childKey) => {
                  return constraints[childKey];
                },
              );
              if (!message) message = Object.values(constraints)[0];
            });
          }
        });

        return new UnprocessableEntityException({
          success: false,
          status: 422,
          error: {
            code: 422,
            message,
          },
          errors,
        });
      },
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
    new HttpExceptionFilter(),
  );

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}

bootstrap();
