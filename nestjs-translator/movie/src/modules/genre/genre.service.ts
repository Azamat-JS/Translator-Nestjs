import { DataSource, InjectDb, Translatable } from '@movie/db';
import { GenreResponseDto } from './genre.dto';
import { AppConfig } from '../../common/config/app.config';
import { sql } from 'drizzle-orm';

export class GenreService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(lang: string, limit?: number) {
    const genres = await this.db.query.genres.findMany({
      with: {
        image: true,
      },
      orderBy: (genres, { asc }) => [
        asc(genres.sequence),
        /* @formatter:off */
        sql`COALESCE(${genres.title}->>${lang}, ${genres.title}->>${this.config.mainLang}) ASC`,
        /* @formatter:off */
      ],
      limit: limit,
    });

    return genres.map((genre) => this.mapToResponseDto(genre, lang));
  }

  private mapToResponseDto(
    genre: {
      id: string;
      title: Translatable;
      slug: string;
      sequence: number;
      image: {
        path: string;
      } | null;
    },
    lang: string,
  ): GenreResponseDto {
    return {
      id: genre.id,
      title: genre.title[lang] ?? genre.title[this.config.mainLang],
      slug: genre.slug,
      imageUrl: this.config.pathToUrl(genre.image?.path),
    };
  }
}
