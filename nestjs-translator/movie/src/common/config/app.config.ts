import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { appLanguages } from '@movie/db/enums/base.enum';

@Configuration()
export class AppConfig {
  @IsString()
  @IsNotEmpty()
  @Value('APP_URL')
  appUrl!: string;

  @IsString()
  @IsOptional()
  @Value('THUMBOR_URL')
  thumborUrl!: string;

  @IsString()
  @IsNotEmpty()
  @Value('DATABASE_URL')
  databaseUrl!: string;

  @IsString()
  @IsNotEmpty()
  @Value('S3_URL')
  s3Url!: string;

  @IsString()
  @IsNotEmpty()
  @Value('S3_ACCESS_KEY')
  s3AccessKey!: string;

  @IsString()
  @IsNotEmpty()
  @Value('S3_SECRET_KEY')
  s3SecretKey!: string;

  @IsString()
  @IsNotEmpty()
  @Value('S3_BUCKET')
  s3Bucket!: string;

  @IsString()
  @IsNotEmpty()
  @Value('S3_REGION')
  s3Region!: string;

  @IsString()
  @IsNotEmpty()
  @Value('MAIN_LANG')
  mainLang: appLanguages = appLanguages.OZ;

  @Value('S3_PUBLIC_BUCKET')
  publicBucket: string = 'movies';

  pathToUrl(
    path: string | null | undefined,
    width?: number,
    height?: number,
  ): string | null {
    if (!path) {
      return null;
    }
    if (this.thumborUrl && width && height) {
      return `${this.thumborUrl}/unsafe/${width}x${height}/${this.appUrl}/files/${path}`;
    }
    return `${this.appUrl}/files/${path}`;
  }

  @IsString()
  @IsNotEmpty()
  @Value('JWT_SECRET')
  jwtSecret!: string;

  @IsString()
  @IsNotEmpty()
  @Value('JWT_EXPIRES_IN')
  jwtExpiresIn!: string;

  @IsString()
  @IsNotEmpty()
  @Value('APP_STORE_URL')
  appStoreUrl!: string;

  @IsString()
  @IsNotEmpty()
  @Value('PLAY_MARKET_URL')
  playMarketUrl!: string;

  @IsString()
  @IsNotEmpty()
  @Value('STREAM_SECRET')
  streamSecret!: string;
}
