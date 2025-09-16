import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { DataSource, InjectDb, reactions, titles } from '@movie/db';
import { and, count, eq, InferSelectModel, sql } from 'drizzle-orm';
import { AppConfig } from '../../common/config/app.config';
import {
  appLanguages,
  appLanguagesArray,
  formatMediaQuality,
  reactionType,
  titleAccessType,
  titleStatus,
  titleType,
  User,
} from '@movie/db/enums/base.enum';
import {
  TitleFilterDto,
  TitleListResponseDto,
  TitleResponseDto,
} from './title.dto';
import { EpisodeService } from '../episode/episode.service';
import { RequestWithUser } from '../../common/types/request-with-user';
import { plainToInstance } from 'class-transformer';
import { __ } from '@app/helpers/translation.helper';

type Title = Omit<InferSelectModel<typeof titles>, 'providerId'>;
type PopulatedTitle = Title & {
  categories?;
  genres?;
  languages?;
  providers?;
  countries?;
  externalRatings?;
  posterListImage?;
  titleImage?;
  posterVerticalImg?;
  posterHorizontalImg?;
  franchise?;
  logoPosition?;
  mediaFile:
    | {
        path: string;
        quality: string;
      }
    | null
    | undefined;
};

@Injectable({ scope: Scope.REQUEST })
export class TitleService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly config: AppConfig,
    private readonly episodesService: EpisodeService,
  ) {}

  async get(req: RequestWithUser, filters: TitleFilterDto) {
    const language = req.lang;
    const page = filters.getPage();
    const perPage = filters.getPerPage();
    const offset = (page - 1) * perPage;

    const total: number = await this.totalTitles(filters);

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
    return this.db.query.titles.findMany({
      where: {
        status: titleStatus.PUBLISHED,
        ...(filters.categoryIds?.length && {
          categories: { id: { in: filters.categoryIds } },
        }),
        ...(filters.genreIds?.length && {
          genres: { id: { in: filters.genreIds } },
        }),
        ...(filters.actorIds?.length || filters.actorRoleIds?.length
          ? {
              titlesOnActors: {
                ...(filters.actorIds?.length && {
                  actorId: { in: filters.actorIds },
                }),
                ...(filters.actorRoleIds?.length && {
                  roleId: { in: filters.actorRoleIds },
                }),
              },
            }
          : {}),
        ...(filters.search?.length && {
          /* @formatter:off */
          RAW: () =>
            sql`(${sql.raw(
              appLanguagesArray
                .map(
                  (lang) => `
                      title->>'${lang}' ILIKE ${`'%${filters.search}%'`}`,
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
        posterVerticalImg: true,
        posterHorizontalImg: true,
        titleImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        // genres: {
        //   columns: {
        //     createdAt: false,
        //     updatedAt: false,
        //   },
        //   orderBy: (genres, { asc }) => [
        //     asc(genres.sequence),
        //     /* @formatter:off */
        //     sql`COALESCE(${genres.title}->>${language}, ${genres.title}->>${mainLang}) ASC`,
        //     /* @formatter:on */
        //   ],
        //   limit: 1,
        // },
      },
      orderBy: (titles) => [
        /* @formatter:off */
        sql`(${titles.topUntil}) IS NOT NULL DESC`,
        sql`COALESCE(${titles.title}->>${language}, ${titles.title}->>${mainLang}) ASC`,
        /* @formatter:on */
      ],
      limit: perPage,
      offset: offset,
    });
  }

  private async totalTitles(filters: TitleFilterDto): Promise<number> {
    const actorRoleFilter = 
  filters.actorIds?.length && filters.actorRoleIds?.length
    ? [
        sql` EXISTS (
          SELECT 1 FROM titles_on_actors AS actors
          WHERE actors.title_id = id
            AND actors.actor_id IN (${sql.join(filters.actorIds, sql`, `)})
            AND actors.role_id IN (${sql.join(filters.actorRoleIds, sql`, `)})
        )`,
      ]
    : filters.actorIds?.length
    ? [
        sql` EXISTS (
          SELECT 1 FROM titles_on_actors AS actors
          WHERE actors.title_id = id
            AND actors.actor_id IN (${sql.join(filters.actorIds, sql`, `)})
        )`,
      ]
    : filters.actorRoleIds?.length
    ? [
        sql` EXISTS (
          SELECT 1 FROM titles_on_actors AS actors
          WHERE actors.title_id = id
            AND actors.role_id IN (${sql.join(filters.actorRoleIds, sql`, `)})
        )`,
      ]
    : [];

    const [total] = await this.db
      .select({ count: count() })
      .from(titles)
      .where(
        and(
          sql`status = ${titleStatus.PUBLISHED}`,
          ...(filters.categoryIds?.length
            ? [
                sql` EXISTS (
                  SELECT 1 FROM titles_on_categories AS categories
                  WHERE categories.title_id = id AND categories.category_id in (${sql.join(filters.categoryIds, sql`, `)})
                )`,
              ]
            : []),
          ...(filters.genreIds?.length
            ? [
                sql` EXISTS (
                  SELECT 1 FROM titles_on_genres AS genres
                  WHERE genres.title_id = id AND genres.genre_id in (${sql.join(filters.genreIds, sql`, `)})
                )`,
              ]
            : []),
          ...actorRoleFilter,
          ...(filters.search?.length
            ? [
                sql`(${sql.raw(
                  appLanguagesArray
                    .map(
                      (lang) => `
                      title->>'${lang}' ILIKE '%${filters.search}%'`,
                    )
                    .join(' OR '),
                )})`,
              ]
            : []),
        ),
      );
      
  
    return total.count;
  }
  
  

  async getOne(id: string, user: User, language: appLanguages) {
    const mainLang = this.config.mainLang;

    const title = await this.db.query.titles.findFirst({
      where: { id, status: titleStatus.PUBLISHED },
      with: {
        franchise: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        externalRatings: {
          with: {
            rating: {
              where: {
                titleId: id,
              },
              columns: {
                rating: true,
                votes: true,
              },
            },
            icon: {
              columns: {
                createdAt: false,
                updatedAt: false,
                ownerType: false,
                ownerId: false,
                language: false,
                sequence: false,
                disk: false,
              },
            },
          },
        },
        posterListImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        posterVerticalImg: true,
        posterHorizontalImg: true,
        logoPosition: true,
        titleImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
        genres: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
          orderBy: (genres, { asc }) => [
            asc(genres.sequence),
            /* @formatter:off */
            sql`COALESCE(${genres.title}->>${language}, ${genres.title}->>${mainLang}) ASC`,
            /* @formatter:off */
          ],
        },
        categories: {
          where: {
            isActive: true,
          },
          columns: {
            createdAt: false,
            updatedAt: false,
          },
          orderBy: (categories, { asc }) => [
            asc(categories.sequence),
            // prettier-ignore
            /* @formatter:off */
            sql`COALESCE(${categories.title}->>${language}, ${categories.title}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
        },
        providers: true,
        languages: {
          orderBy: (languages, { asc }) => [
            asc(languages.sequence),
            /* @formatter:off */
            sql`COALESCE(${languages.name}->>${language}, ${languages.name}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
        mediaFile: true,
        countries: {
          orderBy: (countries, { asc }) => [
            asc(countries.sequence),
            /* @formatter:off */
            sql`COALESCE(${countries.name}->>${language}, ${countries.name}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });

    if (!title) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }

    //user's watch history
    await this.getWatchHistory(title, user);

    if (title.type === titleType.SERIES) {
      title['seasons'] = await this.episodesService.getGroupedBySeason(
        title.id,
      );
    }

    // User rating
    await this.rating(title, user);

    // Check if the title is in user's favorites
    title['is_favorite'] = await this.isFavorite(title.id, user);

    //like dislike total and user like dislike
    await this.getReactions(title, user);

    return this.translate(title, language);
  }

  private async getReactions(
    title: InferSelectModel<typeof titles>,
    user: User,
  ) {
    const totalReactions = await this.db
      .select({
        // @formatter:off
        like: sql`COUNT(CASE WHEN type = ${reactionType.LIKE} THEN 1 END)`,
        dislike: sql`COUNT(CASE WHEN type = ${reactionType.DISLIKE} THEN 1 END)`,
        // @formatter:on
      })
      .from(reactions)
      .where(eq(reactions.titleId, title.id));

    title['total_reactions'] = {
      like: Number(totalReactions[0].like),
      dislike: Number(totalReactions[0].dislike),
    };

    const userReaction = await this.db.query.reactions.findFirst({
      where: {
        titleId: title.id,
        userId: user.id,
      },
      columns: {
        type: true,
      },
    });

    title['user_reaction'] = userReaction?.type ?? null;
  }

  private async isFavorite(titleId: string, user: User): Promise<boolean> {
    const favorite = await this.db.query.favorites.findFirst({
      where: {
        titleId: titleId,
        userId: user.id,
      },
    });
    return !!favorite;
  }

  private async rating(title: InferSelectModel<typeof titles>, user: User) {
    const userRating = await this.db.query.rating.findFirst({
      where: {
        titleId: title.id,
        userId: user.id,
      },
      columns: {
        rating: true,
        comment: true,
        createdAt: true,
      },
    });
    title['user_rating'] = null;
    if (userRating?.rating) {
      title['user_rating'] = {
        rating: userRating.rating,
        comment: userRating.comment,
        created_at: userRating.createdAt,
      };
    }
  }

  private async getWatchHistory(
    title: InferSelectModel<typeof titles>,
    user: User,
  ) {
    const watchHistory = await this.db.query.watchHistory.findFirst({
      where: {
        titleId: title.id,
        userId: user.id,
      },
      orderBy: (watchHistory, { desc }) => [desc(watchHistory.createdAt)],
    });
    if (watchHistory?.id) {
      if (title.type === titleType.SERIES && watchHistory.episodeId) {
        const episode = await this.db.query.episodes.findFirst({
          where: { id: watchHistory.episodeId },
          columns: { season: true, episodesNumber: true },
        });

        title['last_episode_id'] = watchHistory.episodeId;
        title['last_season'] = episode?.season;
        title['episode_number'] = episode?.episodesNumber;
      }
      title['last_watch_time'] = watchHistory.watchedSeconds;
    } else {
      title['last_watch_time'] = 0;
      if (title.type === titleType.SERIES) {
        title['last_episode_id'] = null;
        title['last_season'] = null;
        title['episode_number'] = null;
      }
    }
  }

  async getOneBySlug(slug: string, user: User, language: appLanguages) {
    const id = await this.db.query.titles.findFirst({
      where: { slug },
      columns: { id: true },
    });
    if (!id) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }
    return this.getOne(id.id, user, language);
  }

  public listResponseToDto(title, lang: string): TitleListResponseDto {
    const mainLang = this.config.mainLang;

    // PosterListImage (til bo‘yicha)
    const posterListImg =
      title.posterListImage?.find((img) => img.language === lang) ??
      title.posterListImage.find((img) => img.language === mainLang);
    // PosterTitleImage (til bo‘yicha)
    const posterTitleImg =
      title.titleImage?.find((img) => img.language === lang) ??
      title.titleImage.find((img) => img.language === mainLang);
    return plainToInstance(TitleListResponseDto, {
      id: title.id,
      title: title.title[lang] ?? title.title[mainLang],
      description: title.description[lang] ?? title.description[mainLang],
      shortDesc: title.shortDesc[lang] ?? title.shortDesc[mainLang],
      showLogo: title.showLogo,
      type: title.type,
      slug: title.slug,
      year: title.releaseDate,
      images: {
        main: this.config.pathToUrl(posterListImg?.path),
        title: this.config.pathToUrl(posterTitleImg?.path),
        horizontal: this.config.pathToUrl(title.posterHorizontalImg?.path),
        vertical: this.config.pathToUrl(title.posterVerticalImg?.path),
      },
      releaseDate: title.releaseDate,
      age: title.age,
      accessType: title.accessType,
      hasAccess: title.true,
    });
  }

  private translate(data: PopulatedTitle, language: appLanguages) {
    const mainLang = this.config.mainLang;
    let posterListImage =
      data.posterListImage.find((img) => img.language === language) ??
      data.posterListImage.find((img) => img.language === mainLang);
    let titleImage =
      data.titleImage.find((img) => img.language === language) ??
      data.titleImage.find((img) => img.language === mainLang);

    const title = {
      ...data,
      title: data.title[language] ?? data.title[mainLang],
      short_desc: data.shortDesc[language] ?? data.shortDesc[mainLang],
      show_logo: data.showLogo,
      logo_position: data.logoPosition
        ? {
            alignment: data.logoPosition.alignment,
            vertical: data.logoPosition.vertical,
            horizontal: data.logoPosition.horizontal,
          }
        : null,
      images: {
        main: this.config.pathToUrl(posterListImage?.path),
        title: this.config.pathToUrl(titleImage?.path),
        horizontal: this.config.pathToUrl(data.posterHorizontalImg?.path),
        vertical: this.config.pathToUrl(data.posterVerticalImg?.path),
      },
      file_url: data.mediaFile
        ? `${this.config.appUrl}/stream/${data.mediaFile.path}`
        : undefined,
      file_quality: data.mediaFile?.quality
        ? formatMediaQuality(data.mediaFile.quality)
        : undefined,
      description: data.description[language] ?? data.description[mainLang],
    };

    title.categories = title.categories.map((category) => ({
      ...category,
      title: category.title[language] ?? category.title[mainLang],
    }));

    title.genres = title.genres.map((genre) => ({
      ...genre,
      title: genre.title[language] ?? genre.title[mainLang],
    }));

    title.languages = title.languages.map((lang) => ({
      ...lang,
      name: lang.name[language] ?? lang.name[mainLang],
    }));

    title.providers = title.providers.map((provider) => ({
      ...provider,
      title: provider.title[language] ?? provider.title[mainLang],
      icon_url: this.config.pathToUrl(provider.icon?.path),
    }));
    title.countries = title.countries.map((country) => ({
      ...country,
      name: country.name[language] ?? country.name[mainLang],
    }));

    title['external_ratings'] = title.externalRatings.map((rating) => ({
      ...rating,
      icon: this.config.pathToUrl(rating.icon?.path),
      name: rating.name,
      rating: rating.rating?.rating,
      votes: rating.rating?.votes,
    }));
    title.franchise = title.franchise
      ? {
          ...title.franchise,
          title:
            title.franchise.name[language] ?? title.franchise.name[mainLang],
        }
      : null;

    title['share_url'] = `${this.config.appUrl}/movies/${title.slug}`;
    title['has_access'] = title.accessType === titleAccessType.FREE; //todo agar access_type free bo'lmasa  bu kinoni bu odam purchase qilganmi yo'qmi tekshiradi. agar bu kinoga oldin pul to'lamagan bo'lsa tekshiramiz bu kino purchase bo'lsa error agar kino type subcription bo'lsa user subscriptioni active bo'lishi kerak
    title.externalRatings = undefined;
    title.posterHorizontalImg = undefined;
    title.titleImage = undefined;
    title.posterVerticalImg = undefined;
    title.posterListImage = undefined;
    title.mediaFile = undefined;
    title.logoPosition = undefined;

    // return title;
    return plainToInstance(TitleResponseDto, title);
  }

  async getBySlugToShare(slug: string) {
    const title = await this.db.query.titles.findFirst({
      where: { slug, status: titleStatus.PUBLISHED },
      with: {
        posterHorizontalImg: {
          columns: {
            sequence: false,
            fileName: false,
            disk: false,
            createdAt: false,
            updatedAt: false,
          },
        },
        posterListImage: {
          where: {
            language: this.config.mainLang,
          },
          columns: {
            sequence: false,
            fileName: false,
            disk: false,
            createdAt: false,
            updatedAt: false,
          },
          limit: 1,
        },
        genres: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
          orderBy: (genres, { asc }) => [
            asc(genres.sequence),
            /* @formatter:off */
            sql`COALESCE(${genres.title}->>${this.config.mainLang}) ASC`,
            /* @formatter:on */
          ],
          limit: 6,
        },
      },
    });

    if (!title) {
      throw new NotFoundException(
        __('error.not_found', {
          name: __('attributes.title'),
        }),
      );
    }

    return {
      title: title.title[this.config.mainLang],
      description: title.description[this.config.mainLang],
      shortDesc: title.shortDesc[this.config.mainLang],
      slug: title.slug,
      imageUrl: this.config.pathToUrl(
        title.posterHorizontalImg?.path,
        1280,
        720,
      ),
      imageVerticalUrl: this.config.pathToUrl(
        title.posterListImage?.[0]?.path,
        1080,
        1440,
      ),
      releaseDate: title.releaseDate,
      genres: title.genres?.map((genre) => ({
        title: genre.title[this.config.mainLang],
      })),
    };
  }

  //getByFranchiseTitles
  async getByFranchiseTitles(franchiseId: string, req: RequestWithUser) {
    const mainLang: appLanguages = this.config.mainLang;

    const titles = this.db.query.titles.findMany({
      where: {
        franchiseId,
        status: titleStatus.PUBLISHED,
      },
      with: {
        posterListImage: {
          where: {
            /* @formatter:off */
            RAW: (table) =>
              sql`${table.language} in (${req.lang}, ${mainLang})`,
            /* @formatter:on */
          },
        },
        genres: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
          orderBy: (genres, { asc }) => [
            asc(genres.sequence),
            /* @formatter:off */
            sql`COALESCE(${genres.title}->>${req.lang}, ${genres.title}->>${mainLang}) ASC`,
            /* @formatter:on */
          ],
          limit: 1,
        },
      },
      orderBy: (titles, {}) => [
        /* @formatter:off */
        sql`(${titles.topUntil}) IS NOT NULL DESC`,
        sql`COALESCE(${titles.title}->>${req.lang}, ${titles.title}->>${mainLang}) ASC`,
        /* @formatter:on */
      ],
    });

    // return  titles.map((item) => this.listResponseToDto(item, language)),
    return titles.then((items) => {
      return items.map((item) => {
        return plainToInstance(TitleListResponseDto, {
          id: item.id,
          title: item.title[req.lang] ?? item.title[mainLang],
          description: item.description[req.lang] ?? item.description[mainLang],
          type: item.type,
          slug: item.slug,
          year: item.releaseDate,
          main_image: this.config.pathToUrl(
            item.posterListImage?.find(
              (img) => img.language === req.lang || img.language === mainLang,
            )?.path,
          ),
          releaseDate: item.releaseDate,
          age: item.age,
          genres: item.genres?.map((genre) => ({
            id: genre.id,
            title: genre.title[req.lang] ?? genre.title[mainLang],
            slug: genre.slug,
          })),
        });
      });
    });
  }

  async getOneById(id: string) {
    const title = await this.db.query.titles.findFirst({
      where: { id, status: titleStatus.PUBLISHED },
    });

    if (!title) {
      throw new NotFoundException(
        __('error.not_found', {
          name: __('attributes.title'),
        }),
      );
    }

    return title;
  }
}
