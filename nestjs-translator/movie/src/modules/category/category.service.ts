import { Injectable } from '@nestjs/common';
import { DataSource, InjectDb, Translatable } from '@movie/db';
import { CategoryResponseDto } from './category.dto';
import { AppConfig } from '../../common/config/app.config';
import { titleStatus } from '@movie/db/enums/base.enum';
import { sql } from 'drizzle-orm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(lang: string, catalog: boolean, with_titles?: boolean) {
    const categories = await this.db.query.categories.findMany({
      where: { isActive: true, isCatalog: catalog },
      orderBy: (categories, { asc }) => [
        asc(categories.sequence),
        // prettier-ignore
        /* @formatter:off */
        sql`COALESCE(${categories.title}->>${lang}, ${categories.title}->>${this.config.mainLang}) ASC`,
        /* @formatter:on */
      ],
      with: {
        ...(with_titles && {
          titles: {
            where: { status: titleStatus.PUBLISHED },
            limit: 5,
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
            },
            columns: {
              id: true,
              title: true,
              shortDesc: true,
              slug: true,
              year: true,
              type: true,
              age: true,
              createdAt: true,
            },
            orderBy: (titles, {}) => [
              /* @formatter:off */
              sql`(${titles.topUntil}) IS NOT NULL DESC`,
              sql`COALESCE(${titles.title}->>${lang}, ${titles.title}->>${this.config.mainLang}) ASC`,
              /* @formatter:on */
            ],
          },
        }),
      },
      columns: {
        isActive: false,
      },
    });
    return categories.map((category) => this.mapToResponseDto(category, lang));
  }

  private mapToResponseDto(
    category: {
      id: string;
      title: Translatable;
      slug: string;
      titles?: any[];
    },
    lang: string,
  ): CategoryResponseDto {
    const mainLang = this.config.mainLang;
    return {
      ...category,
      title: category.title[lang] ?? category.title[mainLang],
      titles:
        category.titles?.map((title) => ({
          ...title,
          title: title.title[lang] ?? title.title[mainLang],
          short_desc: title.shortDesc[lang] ?? title.shortDesc[mainLang],
          images: {
            main: this.config.pathToUrl(
              title.posterListImage?.find((img) => img.language === lang)
                ?.path ??
                title.posterListImage?.find((img) => img.language === mainLang)
                  ?.path,
            ),
            title: this.config.pathToUrl(
              title.titleImage?.find((img) => img.language === lang)?.path ??
                title.titleImage?.find((img) => img.language === mainLang)
                  ?.path,
            ),
            horizontal: this.config.pathToUrl(title.posterHorizontalImg?.path),
            vertical: this.config.pathToUrl(title.posterVerticalImg?.path),
          },
          posterListImage: undefined,
          titleImage: undefined,
          posterHorizontalImg: undefined,
          posterVerticalImg: undefined,
          createdAt: undefined,
          shortDesc: undefined,
        })) || [],
    };
  }
}
