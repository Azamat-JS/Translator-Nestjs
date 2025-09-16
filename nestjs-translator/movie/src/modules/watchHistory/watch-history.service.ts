import {
  DataSource,
  InjectDb,
  latestWatchHistory,
  watchHistory,
} from '@movie/db';
import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { titleType } from '@movie/db/enums/base.enum';
import { AppConfig } from '../../common/config/app.config';
import { PaginationDto } from '../../dto/pagination.dto';
import { WatchHistoryDto } from './watch-history.dto';
import { RequestWithUser } from '../../common/types/request-with-user';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { __ } from '@app/helpers/translation.helper';
import { format } from 'date-fns';

export class WatchHistoryService {
  constructor(
    @InjectDb() private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async createOrUpdate(req: RequestWithUser, dto: WatchHistoryDto) {
    const { titleId, episodeId, watchedSeconds } = dto;
    let durationInSeconds: number | null;
    const title = await this.db.query.titles.findFirst({
      where: { id: titleId },
      columns: { durationInSeconds: true, type: true },
    });
    if (!title?.type) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }

    if (episodeId) {
      if (title.type === titleType.MOVIE) {
        throw new BadRequestException(
          __('error.not_required', { name: __('attributes.episode') }),
        );
      }
      const episode = await this.db.query.episodes.findFirst({
        where: { id: episodeId, titleId: dto.titleId },
        columns: { durationInSeconds: true },
      });
      durationInSeconds = episode?.durationInSeconds ?? null;
    } else {
      if (title.type === titleType.SERIES) {
        throw new BadRequestException(
          __('error.required', { name: __('attributes.episode') }),
        );
      }
      durationInSeconds = title.durationInSeconds ?? null;
    }
    if (!durationInSeconds)
      throw new NotFoundException(
        __('error.not_determined', { name: __('attributes.episode') }),
      );

    if (watchedSeconds > durationInSeconds) {
      throw new NotFoundException(__('error.watching_duration_limited'));
    }

    const watchHis = await this.db.query.watchHistory.findFirst({
      where: {
        titleId: titleId,
        userId: req.user.id,
        episodeId: episodeId,
      },
    });

    let watchCount = watchHis?.watchCount ?? 1;
    if (
      watchHis?.id &&
      watchHis.isFinished &&
      dto.watchedSeconds < watchHis.watchedSeconds
    ) {
      watchCount++;
    }

    const isFinished = watchedSeconds > Math.floor(durationInSeconds * 0.9); // 90% dan ko'p tomosha qilgan bo'lsa, tugallangan deb hisoblaymiz

    if (watchHis?.id) {
      await this.db
        .update(watchHistory)
        .set({
          watchedSeconds,
          isFinished,
          watchCount,
          deletedAt: null,
        })
        .where(eq(watchHistory.id, watchHis.id));
    } else {
      await this.db.insert(watchHistory).values({
        userId: req.user.id,
        titleId: titleId,
        episodeId: episodeId ?? null,
        watchedSeconds,
        isFinished,
        watchCount: 1,
      });
    }
  }

  async getWatchHistoryData(
    req: RequestWithUser,
    paginationDto: PaginationDto,
    isContinueWatching: boolean,
  ) {
    const lang = req.lang;
    const mainLang = this.config.mainLang;

    const page = paginationDto.getPage();
    const perPage = paginationDto.getPerPage();
    const offset = (page - 1) * perPage;

    const conditions = [
      isNull(latestWatchHistory.deletedAt),
      eq(latestWatchHistory.userId, req.user.id),
    ];

    // Conditionally add more filters
    if (!isContinueWatching) {
      conditions.push(eq(latestWatchHistory.isFinished, false));
    }

    const [total] = await this.db
      .select({ count: count() })
      .from(latestWatchHistory)
      .where(and(...conditions));

    if (total.count === 0) {
      return {
        data: [],
        current_page: page,
        per_page: perPage,
        total: total.count,
        has_next_page: false,
        has_previous_page: false,
      };
    }
    const watchHistories = await this.db.query.latestWatchHistory.findMany({
      where: {
        userId: req.user.id,
        deletedAt: {isNull: true},
        ...(isContinueWatching ? { isFinished: false } : {}),
      },
      with: {
        posterListImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${lang}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        titleImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${lang}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        posterHorizontalImg: true,
        posterVerticalImg: true,
        episodeLogoPosition: true,
        titleLogoPosition: true,
        genres: {
          orderBy: (genres, { asc }) => [
            asc(genres.sequence),
            /* @formatter:off */
            sql`COALESCE(${genres.title}->>${lang}, ${genres.title}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
          limit: 1,
        },
        episodeImage: true,
        titleMediaFile: true,
        episodeMediaFile: true,
      },
      orderBy: (watchHistory, { desc }) => [desc(watchHistory.updatedAt)],
      limit: perPage,
      offset: offset,
    });

    return {
      data: watchHistories.map((watchHistory) =>
        this.responseDto(watchHistory, lang),
      ),
      current_page: page,
      per_page: perPage,
      total: total.count,
      has_next_page: offset + perPage < total.count,
      has_previous_page: offset > 0,
    };
  }

  private responseDto(watchHistory, lang: string) {
    const mainLang = this.config.mainLang;
    const logoPosition =
      watchHistory.episodeLogoPosition ?? watchHistory.titleLogoPosition;

    return {
      id: watchHistory.id,
      watched_seconds: watchHistory.watchedSeconds,
      is_finished: watchHistory.isFinished,
      watch_count: watchHistory.watchCount,
      deleted_at: watchHistory.deletedAt,
      updated_at: format(
        new Date(watchHistory.updatedAt),
        'yyyy-MM-dd HH:mm:ss',
      ),
      show_logo: watchHistory.showLogo,
      watermark: watchHistory.watermark,
      logo_position: logoPosition
        ? {
            alignment: logoPosition.alignment,
            vertical: logoPosition.vertical,
            horizontal: logoPosition.horizontal,
          }
        : null,
      title: {
        id: watchHistory.titleId,
        title:
          watchHistory.titleTitle[lang] ?? watchHistory.titleTitle[mainLang],
        type: watchHistory.titleType,
        slug: watchHistory.titleSlug,
        year: watchHistory.titleYear,
        duration_in_seconds: watchHistory.titleDurationInSeconds,
        images: {
          main: this.config.pathToUrl(
            watchHistory.posterListImage?.find((img) => img.language === lang)
              ?.path ??
              watchHistory.posterListImage?.find(
                (img) => img.language === mainLang,
              )?.path,
          ),
          title: this.config.pathToUrl(
            watchHistory.titleImage?.find((img) => img.language === lang)
              ?.path ??
              watchHistory.posterListImage?.find(
                (img) => img.language === mainLang,
              )?.path,
          ),
          horizontal: this.config.pathToUrl(
            watchHistory.posterHorizontalImg?.path,
          ),
          vertical: this.config.pathToUrl(watchHistory.posterVerticalImg?.path),
        },
        file_url: watchHistory.titleMediaFile
          ? `${this.config.appUrl}/stream/${watchHistory.titleMediaFile.path}`
          : undefined,
        titleMediaFile: undefined,
        genre:
          watchHistory.genres.length > 0
            ? {
                id: watchHistory.genres[0]?.id ?? null,
                title:
                  watchHistory.genres[0]?.title[lang] ??
                  watchHistory.genres[0]?.title[mainLang],
              }
            : null,
      },
      episode: watchHistory.episodeId
        ? {
            id: watchHistory.episodeId,
            duration_in_seconds: watchHistory.episodeDurationInSeconds,
            name:
              watchHistory.episodeName?.[lang] ??
              watchHistory.episodeName?.[mainLang],
            season: watchHistory.episodeSeason,
            episodes_number: watchHistory.episodeEpisodesNumber,
            image_url: this.config.pathToUrl(watchHistory.episodeImage?.path),
            file_url: watchHistory.episodeMediaFile
              ? `${this.config.appUrl}/stream/${watchHistory.episodeMediaFile.path}`
              : undefined,
            episodeMediaFile: undefined,
          }
        : null,
    };
  }

  async deleteWatchHistory(id: string) {
    const foundHistory = await this.db.query.watchHistory.findFirst({
      where: { id },
    });

    if (!foundHistory) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }

    const isDeleted = foundHistory.deletedAt !== null;

    await this.db
      .update(watchHistory)
      .set({
        deletedAt: isDeleted ? null : new Date(),
      })
      .where(eq(watchHistory.id, id));
  }
}
