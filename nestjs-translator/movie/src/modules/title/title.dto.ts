import { TranslatableDto } from '../../dto/translatable.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { titleAccessType, titleType } from '@movie/db/enums/base.enum';
import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TitleResponseDto {
  id: string;
  @Type(() => TranslatableDto)
  title: TranslatableDto;
  @Type(() => TranslatableDto)
  description: TranslatableDto;
  @Type(() => TranslatableDto)
  @Expose({ name: 'short_desc', toPlainOnly: true })
  shortDesc: TranslatableDto;
  @Expose({ name: 'show_logo', toPlainOnly: true })
  showLogo: boolean;
  type: titleType;
  slug: string;
  images: {
    main: string | null;
    title: string | null;
    horizontal: string | null;
    vertical: string | null;
  };
  @Expose({ name: 'release_date', toPlainOnly: true })
  releaseDate: Date;
  @Expose({ name: 'duration_in_seconds', toPlainOnly: true })
  durationInSeconds: number;
  @Expose({ name: 'avg_rating', toPlainOnly: true })
  avgRating: { rating: number; votes: number };
  age: number | null;
  year: number | null;
  @Expose({ name: 'buy_price', toPlainOnly: true })
  buyPrice: number | null;
  @Expose({ name: 'created_at', toPlainOnly: true })
  createdAt: Date;
  @Expose({ name: 'updated_at', toPlainOnly: true })
  updatedAt: Date;
  @Expose({ name: 'last_episode_id', toPlainOnly: true })
  lastEpisodeId: string | null;
  @Expose({ name: 'last_season', toPlainOnly: true })
  lastSeason: number | null;
  @Expose({ name: 'last_watch_time', toPlainOnly: true })
  lastWatchTime: number | null;
  @Expose({ name: 'episode_number', toPlainOnly: true })
  episodeNumber: number | null;
  @Expose({ name: 'access_type', toPlainOnly: true })
  accessType: string;
  @Expose({ name: 'has_access', toPlainOnly: true })
  hasAccess: boolean;
}

export class TitleListResponseDto {
  id: string;
  @Type(() => TranslatableDto)
  title: TranslatableDto;
  @Type(() => TranslatableDto)
  description: TranslatableDto;
  @Type(() => TranslatableDto)
  @Expose({ name: 'short_desc', toPlainOnly: true })
  shortDesc: TranslatableDto;
  type: titleType;
  slug: string;
  images: {
    main: string | null;
    title: string | null;
    horizontal: string | null;
    vertical: string | null;
  };
  @Expose({ name: 'release_date', toPlainOnly: true })
  releaseDate: Date;
  age: number | null;
  year: number | null;
  @Expose({ name: 'share_url', toPlainOnly: true })
  shareUrl: string;
  @Expose({ name: 'access_type', toPlainOnly: true })
  accessType: string;
  @Expose({ name: 'has_access', toPlainOnly: true })
  hasAccess: boolean;
  @Expose({ name: 'show_logo', toPlainOnly: true })
  showLogo: boolean;
}

export class TitleFilterDto extends PaginationDto {
  @Expose({ name: 'category_ids', toPlainOnly: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({ type: [String], name: 'category_ids' })
  categoryIds?: string[];

  @Expose({ name: 'genre_ids', toPlainOnly: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({ type: [String], name: 'genre_ids' })
  genreIds?: string[];

  @Expose({ name: 'actor_ids', toPlainOnly: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({ type: [String], name: 'actor_ids' })
  actorIds?: string[];

  @Expose({ name: 'role_ids', toPlainOnly: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({ type: [String], name: 'role_ids' })
  actorRoleIds?: string[];
  
  @IsOptional()
  search?: string;

  @IsOptional()
  @Expose({ name: 'access_type', toPlainOnly: true })
  @ApiPropertyOptional({ name: 'access_type', enum: titleAccessType })
  accessType?: titleAccessType;
}
