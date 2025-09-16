import { Module } from '@nestjs/common';
import { ConfigifyModule } from '@itgorillaz/configify';
import { MovieDbModule } from '@movie/db';
import { AppConfig } from './common/config/app.config';
import { CategoryModule } from './modules/category/category.module';
import { GenreModule } from './modules/genre/genre.module';
import { TitleModule } from './modules/title/title.module';
import { ActorModule } from './modules/actor/actor.module';
import { FsModule } from '@movie/fs/fs.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { BannerModule } from './modules/banner/banner.module';
import { TrailerModule } from './modules/trailer/trailer.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { AuthModule } from './common/auth/auth.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { PlanModule } from './modules/plan/plan.module';
import { JwtAuthGuard } from './common/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RatingModule } from './modules/rating/rating.module';
import { StreamModule } from './modules/stream/stream.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PromoCodeModule } from './modules/promoCode/promoCode.module';
import { SimilarModule } from './modules/similar/similar.module';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent } from 'http';

import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { WatchHistoryModule } from './modules/watchHistory/watch-history.module';
import { CommentModule } from './modules/comment/comment.module';

const agent = new Agent({
  keepAlive: true,
  maxSockets: 1000,
});

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets'), // ✅ absolute path from project root
      serveRoot: '/assets',
      serveStaticOptions: { index: false },
    }),
    ConfigifyModule.forRootAsync(),
    MovieDbModule.forRootAsync({
      inject: [AppConfig],
      global: true,
      useFactory: (appConfig: AppConfig) => {
        return {
          connectionString: appConfig.databaseUrl,
        };
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
        new CookieResolver(['lang']),
      ],
    }),
    FsModule.forRootAsync({
      name: 'public',
      inject: [AppConfig],
      global: true,
      useFactory(appConfig: AppConfig) {
        return {
          s3: {
            requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
            endpoint: appConfig.s3Url,
            region: appConfig.s3Region,
            credentials: {
              secretAccessKey: appConfig.s3SecretKey,
              accessKeyId: appConfig.s3AccessKey,
            },
            forcePathStyle: true,
          },
          flyStorageOptions: {
            bucket: appConfig.s3Bucket,
          },
        };
      },
    }),
    FsModule.forRootAsync({
      name: 'private',
      inject: [AppConfig],
      global: true,
      useFactory(appConfig: AppConfig) {
        return {
          s3: {
            requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
            endpoint: appConfig.s3Url,
            region: appConfig.s3Region,
            credentials: {
              secretAccessKey: appConfig.s3SecretKey,
              accessKeyId: appConfig.s3AccessKey,
            },
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
            forcePathStyle: true,
          },
          flyStorageOptions: {
            bucket: 'private',
          },
        };
      },
    }),
    CategoryModule,
    CommentModule,
    GenreModule,
    TitleModule,
    ActorModule,
    EpisodeModule,
    BannerModule,
    TrailerModule,
    PlanModule,
    FavoriteModule,
    AuthModule,
    ReactionModule,
    RatingModule,
    StreamModule,
    PromoCodeModule,
    SimilarModule,
    WatchHistoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class MovieModule {}
