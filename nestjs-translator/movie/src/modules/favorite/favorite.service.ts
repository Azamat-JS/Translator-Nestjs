import { Injectable } from '@nestjs/common';
import { DataSource, favorites, favoriteTitlesView, InjectDb } from '@movie/db';
import { and, count, eq, sql } from 'drizzle-orm';
import {
  appLanguagesArray,
  attachDetach,
  titleStatus,
} from '@movie/db/enums/base.enum';
import { RequestWithUser } from '../../common/types/request-with-user';
import { TitleFilterDto, TitleListResponseDto } from '../title/title.dto';
import { AppConfig } from '../../common/config/app.config';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectDb() private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async attachDetach(titleId: string, userId: number, action: attachDetach) {
    if (action === attachDetach.ATTACH) {
      return this.db
        .insert(favorites)
        .values({ titleId, userId })
        .onConflictDoNothing();
    }
    if (action === attachDetach.DETACH) {
      return this.db
        .delete(favorites)
        .where(
          and(eq(favorites.titleId, titleId), eq(favorites.userId, userId)),
        );
    }
  }

  async get(req: RequestWithUser, filters: TitleFilterDto) {
    const language = req.lang;
    const page = filters.getPage();
    const perPage = filters.getPerPage();
    const offset = (page - 1) * perPage;
    console.log(filters);

    const total: number = await this.totalTitles(req, filters);

    if (total === 0) {
      return {
        data: [],
        current_page: page,
        per_page: perPage,
        total: total,
        has_next_page: false,
        has_previous_page: false,
      };
    }

    const data = await this.getData(filters, req, perPage, offset);

    return {
      data: data.map((item) => this.listResponseToDto(item, language)),
      current_page: page,
      per_page: perPage,
      total: total,
      has_next_page: offset + perPage < total,
      has_previous_page: offset > 0,
    };
  }

  private async getData(
    filters: TitleFilterDto,
    req: RequestWithUser,
    perPage: number,
    offset: number,
  ) {
    const mainLang = this.config.mainLang;
    const language = req.lang;

    return this.db.query.favoriteTitlesView.findMany({
      where: {
        status: titleStatus.PUBLISHED,
        userId: req.user.id,
        ...(filters.categoryIds?.length && {
          categories: { id: { in: filters.categoryIds } },
        }),
        ...(filters.genreIds?.length && {
          genres: { id: { in: filters.genreIds } },
        }),
        ...(filters.actorIds?.length && {
          actors: { id: { in: filters.actorIds } },
        }),
        ...(filters.search?.length && {
          /* @formatter:off */
          RAW: (table) =>
            sql`(${sql.raw(
              appLanguagesArray
                .map(
                  (lang) => `
                      title->>'${lang}' ILIKE ${`'%${filters.search}%'`} OR
                      description->>'${lang}' ILIKE ${`'%${filters.search}%'`}`,
                )
                .join(' OR '),
            )})
          `,
          /* @formatter:on */
        }),
      },
      with: {
        posterListImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
          columns: {
            sequence: false,
            fileName: false,
            disk: false,
            createdAt: false,
            updatedAt: false,
          },
        },
        titleImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        posterHorizontalImg: true,
        posterVerticalImg: true,
        genres: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
          orderBy: (genres, { asc }) => [
            asc(genres.sequence),
            /* @formatter:off */
            sql`COALESCE(${genres.title}->>${language}, ${genres.title}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
          limit: 1,
        },
      },
      orderBy: (titles, {}) => [
        /* @formatter:off */
        sql`(${titles.topUntil}) IS NOT NULL DESC`,
        sql`COALESCE(${titles.title}->>${language}, ${titles.title}->>${mainLang}) ASC`,
        sql`${titles.id} ASC`,
        /* @formatter:on */
      ],
      limit: perPage,
      offset: offset,
    });
  }

  private async totalTitles(
    req: RequestWithUser,
    filters: TitleFilterDto,
  ): Promise<number> {
    const [total] = await this.db
      .select({ count: count() })
      .from(favoriteTitlesView)
      .where(
        and(
          /* @formatter:off */
          sql`status = ${titleStatus.PUBLISHED}`,
          sql`user_id = ${req.user.id}`,
          ...(filters.categoryIds?.length
            ? [
                sql` EXISTS (
              SELECT 1 FROM titles_on_categories AS categories
              WHERE categories.title_id = id AND categories.category_id in (${sql.join(filters.categoryIds, sql`, `)}))`,
              ]
            : []),
          ...(filters.genreIds?.length
            ? [
                sql` EXISTS (
              SELECT 1 FROM titles_on_genres AS genres
              WHERE genres.title_id = id AND genres.genre_id in (${sql.join(filters.genreIds, sql`, `)}))`,
              ]
            : []),
          ...(filters.actorIds?.length
            ? [
                sql` EXISTS (
              SELECT 1 FROM titles_on_actors AS actors
              WHERE actors.title_id = id AND actors.actor_id in (${sql.join(filters.actorIds, sql`, `)}))`,
              ]
            : []),
          ...(filters.search?.length
            ? [
                sql`(${sql.raw(
                  appLanguagesArray
                    .map(
                      (lang) => `
                      title->>'${lang}' ILIKE '%${filters.search}%' OR
                      description->>'${lang}' ILIKE '%${filters.search}%'`,
                    )
                    .join(' OR '),
                )})`,
              ]
            : []),
          /* @formatter:on */
        ),
      );

    return total.count;
  }

  private listResponseToDto(title, lang: string): TitleListResponseDto {
    const mainLang = this.config.mainLang;

    return plainToInstance(TitleListResponseDto, {
      id: title.id,
      title: title.title[lang] ?? title.title[mainLang],
      description: title.description[lang] ?? title.description[mainLang],
      type: title.type,
      slug: title.slug,
      year: title.releaseDate,
      images: {
        main: this.config.pathToUrl(
          title.posterListImage?.find((img) => img.language === lang)?.path ??
            title.posterListImage?.find((img) => img.language === mainLang)
              ?.path,
        ),
        title: this.config.pathToUrl(
          title.titleImage?.find((img) => img.language === lang)?.path ??
            title.titleImage?.find((img) => img.language === mainLang)?.path,
        ),
        horizontal: this.config.pathToUrl(title.posterHorizontalImg?.path),
        vertical: this.config.pathToUrl(title.posterVerticalImg?.path),
      },
      posterListImage: undefined,
      titleImage: undefined,
      posterHorizontalImg: undefined,
      posterVerticalImg: undefined,
      createdAt: undefined,
      releaseDate: title.releaseDate,
      age: title.age,
      genres: title.genres?.map((genre) => ({
        id: genre.id,
        title: genre.title[lang] ?? genre.title[mainLang],
        slug: genre.slug,
      })),
    });
  }
}
