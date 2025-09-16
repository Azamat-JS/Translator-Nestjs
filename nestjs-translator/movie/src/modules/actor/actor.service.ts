import { Injectable, NotFoundException } from '@nestjs/common';
import { actorRoles, DataSource, InjectDb, titlesOnActors } from '@movie/db';
import { AppConfig } from '../../common/config/app.config';
import { appLanguagesArray } from '@movie/db/enums/base.enum';
import { ActorResponseDto } from './actor.dto';
import { asc, eq, sql } from 'drizzle-orm';
import { RequestWithUser } from '../../common/types/request-with-user';
import { __ } from '@app/helpers/translation.helper';

@Injectable()
export class ActorService {
  constructor(
    @InjectDb() private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(req: RequestWithUser, search?: string, limit?: number) {
    const language = req.lang;
    limit = limit || 20;
    const where: Record<string, any> = {
      ...(search && {
        RAW: sql`(${sql.raw(
          appLanguagesArray
            .map((lang) => `name->>'${lang}' ILIKE  ${`'%${search}%'`}`)
            .join(' OR '),
        )})`,
      }),
    };
    const actors = await this.db.query.actors.findMany({
      where,
      with: { image: true },
      orderBy: (actors) => [
        /* @formatter:off */
        sql`COALESCE(${actors.name}->>${language}, ${actors.name}->>${this.config.mainLang}) ASC`,
        /* @formatter:on */
      ],
      limit: limit,
    });
    return actors.map((el) => this.mapToResponseDto(el, language));
  }

  async getByTitleId(req: RequestWithUser, titleId: string) {
    const language = req.lang;

    const rows = await this.db.query.titlesOnActors.findMany({
      where: { titleId },
      with: {
        actor: { with: { image: true } },
        role: true,
      },
      orderBy: { sequence: 'asc' },
    });

    // actorId bo‘yicha group qilamiz
    const grouped = rows.reduce(
      (acc, row) => {
        const actorId = row.actor!.id;
        if (!acc[actorId]) {
          acc[actorId] = {
            ...row.actor,
            roles: [] as {
              role: string | null;
              role_id: string | null;
              sequence: number; // role.sequence (actor_roles.sequence) yoki MAX_SAFE_INTEGER
              titleSequence: number; // titles_on_actors.sequence
            }[],
          };
        }

        acc[actorId].roles.push({
          role_id: row.roleId ?? null,
          role: row.role
            ? (row.role.role[language] ?? row.role.role[this.config.mainLang])
            : null,
          sequence: row.role?.sequence ?? Number.MAX_SAFE_INTEGER,
          titleSequence: row.sequence ?? Number.MAX_SAFE_INTEGER,
        });

        return acc;
      },
      {} as Record<string, any>,
    );

    // massivga o‘tkazamiz, rolelarni tartiblab, actor uchun min seq larni hisoblaymiz
    const actorsArr = Object.values(grouped).map((actor: any) => {
      // sort roles inside actor
      actor.roles = actor.roles
        .sort((a: any, b: any) => {
          if (a.sequence === b.sequence)
            return a.titleSequence - b.titleSequence;
          return a.sequence - b.sequence;
        })
        // saqlash: agar kerak bo'lsa sequence ni qoldiramiz (hozir mapToResponseDto sequence ni e'tiborga olmaydi)
        .map((r: any) => ({
          role: r.role,
          role_id: r.role_id,
          sequence: r.sequence,
          titleSequence: r.titleSequence,
        }));

      // actor uchun eng kichik role.sequence va eng kichik titleSequence hisoblash
      const minRoleSeq = actor.roles.reduce(
        (m: number, r: any) =>
          Math.min(m, r.sequence ?? Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER,
      );
      const minTitleSeq = actor.roles.reduce(
        (m: number, r: any) =>
          Math.min(m, r.titleSequence ?? Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER,
      );

      actor._minRoleSeq = minRoleSeq;
      actor._minTitleSeq = minTitleSeq;

      return actor;
    });

    // actorlarni umumiy tartib: avval minRoleSeq, agar teng bo'lsa minTitleSeq
    actorsArr.sort((a: any, b: any) => {
      if (a._minRoleSeq === b._minRoleSeq)
        return a._minTitleSeq - b._minTitleSeq;
      return a._minRoleSeq - b._minRoleSeq;
    });

    // oxirida mapToResponseDto chaqiramiz (u roles ni qabul qiladi)
    return actorsArr.map((el: any) => this.mapToResponseDto(el, language));
  }

  async getOne(id: string, lang: string) {
    const actor = await this.db.query.actors.findFirst({
      with: {
        image: true,
      },
      where: { id },
    });

    if (!actor) {
      throw new NotFoundException(
        __('error.required', { name: __('attributes.title') }),
      );
    }
    actor['roles'] = await this.getRolesByActorId(actor.id, lang);

    return this.mapToResponseDto(actor, lang);
  }

  //get all roles from titles_on_actors table by actor id grouped by actor id
  private async getRolesByActorId(actorId: string, lang: string) {
    const mainLang = this.config.mainLang;
    const roles = await this.db
      .select({
        role: actorRoles.role,
        roleId: titlesOnActors.roleId,
        count: sql`COUNT(
        ${titlesOnActors.roleId}
        )`,
      })
      .from(actorRoles)
      .innerJoin(titlesOnActors, eq(titlesOnActors.roleId, actorRoles.id))
      .where(eq(titlesOnActors.actorId, actorId))
      .groupBy(actorRoles.role, titlesOnActors.roleId, actorRoles.sequence)
      .orderBy(asc(actorRoles.sequence), asc(actorRoles.role));

    if (roles.length === 0) {
      return [];
    }

    return roles.map((role) => ({
      role: role.role[lang] ?? role.role[mainLang],
      role_id: role.roleId,
      title_count: Number(role.count),
    }));
  }

  private mapToResponseDto(actor, lang: string): ActorResponseDto {
    return {
      id: actor.id,
      name: actor.name[lang] ?? actor.name[this.config.mainLang],
      biography: actor.biography
        ? (actor.biography[lang] ?? actor.biography[this.config.mainLang])
        : null,
      birthDate: actor.birthDate,
      gender: actor.gender,
      deathDate: actor.deathDate,
      slug: actor.slug,
      imageUrl: this.config.pathToUrl(actor.image?.path),
      roles: actor.roles ?? [],
    };
  }
}
