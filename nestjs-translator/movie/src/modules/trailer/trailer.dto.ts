import { Expose } from 'class-transformer';

export class TrailerResponseDto {
  id: string;
  title: string;
  @Expose({ name: 'title_id', toPlainOnly: true })
  titleId: string;
  season: number | null;
  sequence: number;
  @Expose({ name: 'image_url', toPlainOnly: true })
  imageUrl: string | null;

  @Expose({ name: 'file_url', toPlainOnly: true })
  fileUrl: string | null;

  @Expose({ name: 'duration_in_seconds', toPlainOnly: true })
  durationInSeconds: number | null;
}
