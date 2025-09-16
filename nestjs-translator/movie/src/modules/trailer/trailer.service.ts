import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  images,
  InjectDb,
  mediaFiles,
  Translatable,
} from '@movie/db';
import { AppConfig } from '../../common/config/app.config';
import { TrailerResponseDto } from './trailer.dto';
import { __ } from '@app/helpers';
import { InferSelectModel } from 'drizzle-orm';

type MediaFile = InferSelectModel<typeof mediaFiles>;
type Image = InferSelectModel<typeof images>;

@Injectable()
export class TrailerService {
  constructor(
    @InjectDb() private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(titleId: string, lang: string) {
    const trailerList = await this.db.query.trailers.findMany({
      where: { titleId },
      with: {
        image: true,
        mediaFile: true,
      },
      orderBy: (trailers, { asc }) => asc(trailers.sequence),
    });

    return trailerList.map((trailer) => this.mapToResponseDto(trailer, lang));
  }

  async getOne(titleId: string, id: string, lang: string) {
    const trailer = await this.db.query.trailers.findFirst({
      where: { titleId, id },
      with: {
        image: true,
        mediaFile: true,
      },
    });

    if (!trailer?.id) {
      throw new NotFoundException(
        __('error.not_found', {
          name: __('attributes.title'),
        }),
      );
    }

    return this.mapToResponseDto(trailer, lang);
  }

  private mapToResponseDto(
    trailer: {
      id: string;
      title: Translatable | null;
      titleId: string;
      season: number | null;
      sequence: number;
      image?: Image | null;
      mediaFile?: MediaFile | null;
      durationInSeconds: number | null;
    },
    lang: string,
  ): TrailerResponseDto {
    return {
      id: trailer.id,
      title: trailer.title?.[lang] ?? trailer.title?.[this.config.mainLang],
      titleId: trailer.titleId,
      season: trailer.season,
      sequence: trailer.sequence,
      imageUrl: trailer.image
        ? this.config.pathToUrl(trailer.image.path)
        : null,
      fileUrl: trailer.mediaFile
        ? `${this.config.appUrl}/stream/${trailer.mediaFile.path}`
        : null,
      durationInSeconds: trailer.durationInSeconds,
    };
  }
}
