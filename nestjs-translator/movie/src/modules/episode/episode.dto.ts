import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class EpisodeResponseDto {
  id: string;
  name: string;
  @Expose({ name: 'image_url', toPlainOnly: true })
  imageUrl: string | null;
  @Expose({ name: 'file_url', toPlainOnly: true })
  file_url: string | null;
  @Expose({ name: 'file_quality', toPlainOnly: true })
  file_quality: string | null;
  season: number | null;
  @Expose({ name: 'episodes_number', toPlainOnly: true })
  episodesNumber: number;
  @Expose({ name: 'duration_in_seconds', toPlainOnly: true })
  durationInSeconds?: number | null;
  @Expose({ name: 'watched_seconds', toPlainOnly: true })
  watchedSeconds?: number | null;
  @Expose({ name: 'is_finished', toPlainOnly: true })
  isFinished: boolean | null;
}

export class EpisodeQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  season: number;
  @ApiPropertyOptional({ name: 'limit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
