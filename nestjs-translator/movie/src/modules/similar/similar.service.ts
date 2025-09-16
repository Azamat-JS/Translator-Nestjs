import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, InjectDb } from '@movie/db';
import { TitleService } from '../title/title.service';
import { sql } from 'drizzle-orm';
import { RequestWithUser } from '../../common/types/request-with-user';
import { titleStatus } from '@movie/db/enums/base.enum';
import { AppConfig } from '../../common/config/app.config';
import { __ } from '@app/helpers';

@Injectable()
export class SimilarService {
  constructor(
    @InjectDb()
    private readonly db: DataSource,
    private readonly titleService: TitleService,
    private readonly config: AppConfig,
  ) {}

  async getSimilar(titleId: string, limit: number, req: RequestWithUser) {
    const language = req.lang;

    const baseTitle = await this.db.query.titles.findFirst({
      where: { id: titleId, status: titleStatus.PUBLISHED },
      columns: {
        id: true,
        year: true,
      },
      with: {
        genres: { columns: { id: true } },
        categories: { columns: { id: true } },
        providers: { columns: { id: true } },
        tags: { columns: { id: true } },
        countries: { columns: { id: true } },
      },
    });

    if (!baseTitle) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }

    const genreIds = baseTitle.genres?.map((g) => g.id) ?? [];
    const categoryIds = baseTitle.categories?.map((c) => c.id) ?? [];
    const providerIds = baseTitle.providers?.map((p) => p.id) ?? [];
    const tagIds = baseTitle.tags?.map((t) => t.id) ?? [];
    const countryIds = baseTitle.countries?.map((c) => c.id) ?? [];

    // Exclude set starts with current title
    const excludeIds = new Set<string>([titleId]);

    let items: any[] = [];

    const pushUnique = (arr: any[]) => {
      for (const a of arr) {
        if (!excludeIds.has(a.id) && a.id !== titleId) {
          items.push(a);
          excludeIds.add(a.id);
          if (items.length >= limit) break;
        }
      }
    };

    // Stages: genres -> categories -> providers (many-to-many)
    const stages: Array<{
      ids: string[];
      joinTable: string;
      joinCol: string;
      matchKey: 'genreIds' | 'categoryIds' | 'providerIds';
    }> = [
      {
        ids: genreIds,
        joinTable: 'titles_on_genres',
        joinCol: 'genre_id',
        matchKey: 'genreIds',
      },
      {
        ids: categoryIds,
        joinTable: 'titles_on_categories',
        joinCol: 'category_id',
        matchKey: 'categoryIds',
      },
      {
        ids: providerIds,
        joinTable: 'titles_on_providers',
        joinCol: 'provider_id',
        matchKey: 'providerIds',
      },
    ];

    // Helper to build sql parameter list: [sql`id1`, sql`id2`, ...]
    const sqlList = (arr: string[]) => arr.map((v) => sql`${v}`);

    for (const stage of stages) {
      if (items.length >= limit) break;
      if (!stage.ids || stage.ids.length === 0) continue;

      const remaining = limit - items.length;

      // find titles that have any of stage.ids; order by similarity (genre/category/provider counts)
      const more = await this.findTitles(
        language,
        remaining,
        {
          status: titleStatus.PUBLISHED,
          /* @formatter:off */
          RAW: (t) =>
            sql`${t.id} <> ${titleId}
            AND EXISTS (
            SELECT 1 FROM ${sql.identifier(stage.joinTable)} jt
            WHERE jt.title_id = ${t.id}
            AND jt.${sql.identifier(stage.joinCol)} IN (${sql.join(sqlList(stage.ids), sql`, `)})
            )
            AND ${t.id} NOT IN (${sql.join(Array.from(excludeIds), sql`, `)})`,
          /* @formatter:on */
        },
        {
          genreIds,
          categoryIds,
          providerIds,
        },
      );

      pushUnique(more);
    }

    // 3) tags + country (more specific filters)
    if (items.length < limit) {
      const remaining = limit - items.length;

      const rawFn = (t: any) => {
        const parts: any[] = [];

        if (tagIds.length) {
          parts.push(
            sql`EXISTS (
              SELECT 1 FROM titles_on_tags tt 
              WHERE tt.title_id = ${t.id}
            AND tt.tag_id IN (${sql.join(sqlList(tagIds), sql`, `)})
            )`,
          );
        }

        if (countryIds.length) {
          parts.push(
            sql`EXISTS (
              SELECT 1 FROM titles_on_countries tc 
              WHERE tc.title_id = ${t.id}
            AND tc.country_id IN (${sql.join(sqlList(countryIds), sql`, `)})
            )`,
          );
        }

        const combined =
          parts.length === 0
            ? sql`TRUE`
            : parts.length === 1
              ? parts[0]
              : sql`(${sql.join(parts, sql` OR `)})`;
        /* @formatter:off */
        return sql`${t.id} <> ${titleId}
        AND ${combined}
        AND ${t.id} NOT IN (${sql.join(Array.from(excludeIds), sql`, `)})
        AND ${t.status} = ${titleStatus.PUBLISHED}`;
        /* @formatter:on */
      };

      const more = await this.findTitles(
        language,
        remaining,
        { RAW: rawFn },
        {
          genreIds,
          categoryIds,
          providerIds,
        },
      );
      pushUnique(more);
    }

    // 4) Final fallback: latest published (exclude everything already collected)
    if (items.length < limit) {
      const remaining = limit - items.length;
      const more = await this.findTitles(
        language,
        remaining,
        {
          status: titleStatus.PUBLISHED,
          RAW: (t) =>
            sql`${t.id} <> ${titleId}
            AND ${t.id} NOT IN (${sql.join(Array.from(excludeIds), sql`, `)})`,
        },
        {
          genreIds,
          categoryIds,
          providerIds,
        },
      );
      pushUnique(more);
    }

    return items
      .slice(0, limit)
      .map((item) => this.titleService.listResponseToDto(item, language));
  }

  /**
   * findTitles: wrapper that supports similarity ordering with weights.
   * weights: genres=3, categories=3, providers=2, countries=2, tags=1
   */
  private async findTitles(
    language: string,
    limit: number,
    where: any,
    match: {
      genreIds?: string[];
      categoryIds?: string[];
      providerIds?: string[];
      countryIds?: string[];
      tagIds?: string[];
    } = {},
  ) {
    // weighted count expressions
    const genreScore = (t: any) =>
      match.genreIds && match.genreIds.length
        ? sql`3 * (SELECT COUNT(1) 
                   FROM titles_on_genres g 
                   WHERE g.title_id = ${t.id}
        AND g.genre_id IN (${sql.join(
          match.genreIds.map((v) => sql`${v}`),
          sql`, `,
        )}))`
        : sql`0`;

    const categoryScore = (t: any) =>
      match.categoryIds && match.categoryIds.length
        ? sql`3 * (SELECT COUNT(1) 
                   FROM titles_on_categories c 
                   WHERE c.title_id = ${t.id}
        AND c.category_id IN (${sql.join(
          match.categoryIds.map((v) => sql`${v}`),
          sql`, `,
        )}))`
        : sql`0`;

    const providerScore = (t: any) =>
      match.providerIds && match.providerIds.length
        ? sql`2 * (SELECT COUNT(1) 
                   FROM titles_on_providers p 
                   WHERE p.title_id = ${t.id}
        AND p.provider_id IN (${sql.join(
          match.providerIds.map((v) => sql`${v}`),
          sql`, `,
        )}))`
        : sql`0`;

    const countryScore = (t: any) =>
      match.countryIds && match.countryIds.length
        ? sql`2 * (SELECT COUNT(1) 
                   FROM titles_on_countries co 
                   WHERE co.title_id = ${t.id} 
                   AND co.country_id IN (${sql.join(
                     match.countryIds.map((v) => sql`${v}`),
                     sql`, `,
                   )}))`
        : sql`0`;

    const tagScore = (t: any) =>
      match.tagIds && match.tagIds.length
        ? sql`1 * (SELECT COUNT(1) 
                   FROM titles_on_tags tg 
                   WHERE tg.title_id = ${t.id} 
                   AND tg.tag_id IN (${sql.join(
                     match.tagIds.map((v) => sql`${v}`),
                     sql`, `,
                   )}))`
        : sql`0`;

    // total score expression
    const totalScore = (t: any) =>
      sql`${genreScore(t)} + ${categoryScore(t)} + ${providerScore(t)} + ${countryScore(t)} + ${tagScore(t)}`;

    return this.db.query.titles.findMany({
      where,
      with: {
        posterListImage: {
          where: {
            RAW: (table) =>
              /* @formatter:off */
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
            RAW: (table) =>
              /* @formatter:off */
              sql`${table.language} in (${language}, ${this.config.mainLang})`,
            /* @formatter:on */
          },
        },
      },
      orderBy: (t) => [
        // similarity weighted score
        sql`${totalScore(t)} DESC`,

        // show topUntil first
        sql`(${t.topUntil}) IS NOT NULL DESC`,

        // finally alphabetical
        sql`COALESCE(${t.title}->>${language}, ${t.title}->>${this.config.mainLang}) ASC`,
      ],
      limit,
    });
  }
}
