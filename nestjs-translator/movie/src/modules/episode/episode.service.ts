import { DataSource, episodes, InjectDb, Translatable } from '@movie/db';
import { EpisodeQueryDto } from './episode.dto';
import { AppConfig } from '../../common/config/app.config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { titleStatus, User } from '@movie/db/enums/base.enum';
import { and, asc, eq, sql } from 'drizzle-orm';
import { __ } from '@app/helpers/translation.helper';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(titleId: string, query: EpisodeQueryDto, user: User, lang: string) {
    const episodes = await this.db.query.episodes.findMany({
      where: { titleId, status: titleStatus.PUBLISHED, season: query.season },
      with: {
        image: true,
        mediaFile: true,
        watchHistory: {
          where: { userId: user.id },
          columns: {
            watchedSeconds: true,
            isFinished: true,
          },
        },
        logoPosition: true,
      },
      orderBy: (episodes, { asc }) => asc(episodes.episodesNumber),
      limit: query.limit,
    });

    if (episodes.length < 1) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.episode') }),
      );
    }

    return episodes.map((episode) => this.mapToResponseDto(episode, lang));
  }

  async getGroupedBySeason(titleId: string) {
    const seasons = await this.db
      .select({
        age: episodes.season,
        /* @formatter:off */
        count: sql<number>`cast(count(${episodes.id}) as int)`,
      })
      /* @formatter:on */
      .from(episodes)
      .where(
        and(
          eq(episodes.titleId, titleId),
          eq(episodes.status, titleStatus.PUBLISHED),
        ),
      )
      .groupBy(episodes.season)
      .orderBy(asc(episodes.season));

    if (!seasons.length) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.episode') }),
      );
    }
    return seasons.map((season) => ({
      season: season.age,
      count: season.count,
    }));
  }

  async getOne(titleId: string, id: string, lang: string) {
    const episode = await this.db.query.episodes.findFirst({
      where: { titleId, status: titleStatus.PUBLISHED, id },
      with: { image: true, mediaFile: true },
    });

    if (!episode?.id) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.episode') }),
      );
    }

    return this.mapToResponseDto(episode, lang);
  }

  async getOneById(id: string) {
    const episode = await this.db.query.episodes.findFirst({
      where: { id, status: titleStatus.PUBLISHED },
      with: { image: true, mediaFile: true, logoPosition: true },
    });

    if (!episode?.id) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.episode') }),
      );
    }

    return episode;
  }

  private mapToResponseDto(
    episode: {
      id: string;
      name: Translatable | null;
      showLogo: boolean;
      image: {
        path: string;
      } | null;
      mediaFile: {
        path: string;
        quality: string;
      } | null;
      season: number | null;
      episodesNumber: number;
      durationInSeconds?: number | null;
      releaseDate?: Date | null;
      watchHistory?: {
        watchedSeconds: number;
        isFinished: boolean;
      } | null;
      logoPosition?;
    },
    lang: string,
  ): {
    durationInSeconds: number | null | undefined;
    show_logo: boolean;
    episodesNumber: number;
    file_url: string | null | undefined;
    file_quality: string | null | undefined;
    logo_position: {
      alignment: string;
      vertical: string;
      horizontal: string;
    } | null;
    id: string;
    imageUrl: string | null;
    isFinished: boolean;
    name: any;
    season: number | null;
    watchedSeconds: number | null;
  } {
    return {
      id: episode.id,
      name:
        episode.name?.[lang] ?? episode.name?.[this.config.mainLang] ?? null,
      imageUrl: this.config.pathToUrl(episode.image?.path),
      show_logo: episode.showLogo,
      file_url: episode.mediaFile
        ? `${this.config.appUrl}/stream/${episode.mediaFile.path}`
        : null,
      logo_position: episode.logoPosition
        ? {
            alignment: episode.logoPosition.alignment,
            vertical: episode.logoPosition.vertical,
            horizontal: episode.logoPosition.horizontal,
          }
        : null,
      file_quality: episode.mediaFile?.quality,
      season: episode.season,
      episodesNumber: episode.episodesNumber,
      durationInSeconds: episode.durationInSeconds,
      watchedSeconds: episode.watchHistory?.watchedSeconds ?? null,
      isFinished: episode.watchHistory?.isFinished ?? false,
    };
  }
}
