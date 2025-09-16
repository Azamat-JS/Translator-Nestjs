import { Injectable } from '@nestjs/common';
import { DataSource, InjectDb } from '@movie/db';
import { BannerResponseDto } from './banner.dto';
import { AppConfig } from '../../common/config/app.config';
import { sql } from 'drizzle-orm';
import { titleStatus } from '@movie/db/enums/base.enum';

interface BannerWithImage {
  id: string;
  titleId: string;
  title;
}

@Injectable()
export class BannerService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(lang: string) {
    const banners = await this.db.query.banners.findMany({
      where: {
        isActive: true,
        title: { status: titleStatus.PUBLISHED },
      },
      orderBy: (banners, { asc }) => [asc(banners.sequence)],
      with: {
        title: {
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
            trailers: {
              orderBy: (t, { asc }) => asc(t.sequence),
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
                sql`COALESCE(${genres.title}->>${lang}, ${genres.title}->>${this.config.mainLang}) ASC`,
                /* @formatter:off */
              ],
              limit: 2,
            },
          },
        },
      },
      columns: {
        id: true,
        titleId: true,
      },
    });
    return banners.map((banner) => this.mapToResponseDto(banner, lang));
  }

  private mapToResponseDto(
    banner: BannerWithImage,
    lang: string,
  ): BannerResponseDto {
    const mainLang = this.config.mainLang;

    return {
      id: banner.id,
      titleId: banner.titleId,
      title: {
        ...banner.title,
        title: banner.title.title[lang] ?? banner.title.title[mainLang],
        description:
          banner.title.description[lang] ?? banner.title.description[mainLang],
        short_desc:
          banner.title.shortDesc[lang] ?? banner.title.shortDesc[mainLang],
        avg_rating: banner.title.avgRating,
        images: {
          main: this.config.pathToUrl(
            banner.title.posterListImage?.find((img) => img.language === lang)
              ?.path ??
              banner.title.posterListImage?.find(
                (img) => img.language === mainLang,
              )?.path,
          ),
          title: this.config.pathToUrl(
            banner.title.titleImage?.find((img) => img.language === lang)
              ?.path ??
              banner.title.titleImage?.find((img) => img.language === mainLang)
                ?.path,
          ),
          horizontal: this.config.pathToUrl(
            banner.title.posterHorizontalImg?.path,
          ),
          vertical: this.config.pathToUrl(banner.title.posterVerticalImg?.path),
        },
        trailer: banner.title.trailers?.[0]
          ? {
              ...banner.title.trailers[0],
              title: banner.title.trailers[0].title[lang],
            }
          : undefined,
        genres: banner.title.genres?.map((genre) => ({
          id: genre.id,
          title: genre.title[lang] ?? genre.title[mainLang],
          slug: genre.slug,
        })),
        posterListImage: undefined,
        titleImage: undefined,
        posterHorizontalImg: undefined,
        posterVerticalImg: undefined,
        createdAt: undefined,
        shortDesc: undefined,
        avgRating: undefined,
        topUntil: undefined,
        franchiseId: undefined,
      },
    };
  }
}
