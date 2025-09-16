import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WatchHistoryDto {
  // @ValidateIf((o: WatchHistoryDto) => !o.episodeId)
  @ApiProperty({ name: 'title_id' })
  @Expose({ name: 'title_id' })
  @IsUUID()
  titleId: string;

  // @ValidateIf((o: WatchHistoryDto) => !o.titleId)
  @ApiPropertyOptional({ name: 'episode_id' })
  @Expose({ name: 'episode_id' })
  @IsUUID()
  @IsOptional()
  episodeId?: string;

  @ApiProperty({ name: 'watched_seconds' })
  @Expose({ name: 'watched_seconds' })
  @IsInt()
  @Min(0)
  watchedSeconds: number;
}
