import { Expose } from 'class-transformer';

export class GenreResponseDto {
  id: string;
  title: string;
  slug: string;
  @Expose({ name: 'image_url', toPlainOnly: true })
  imageUrl: string | null;
}
