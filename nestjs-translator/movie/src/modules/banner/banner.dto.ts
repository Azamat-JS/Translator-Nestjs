import { Expose } from 'class-transformer';

export class BannerResponseDto {
  id: string;

  @Expose({ name: 'title_id', toPlainOnly: true })
  titleId?: string;
  title;
}
