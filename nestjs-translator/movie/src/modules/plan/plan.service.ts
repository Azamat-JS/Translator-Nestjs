import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, InjectDb, plans, userSubscription } from '@movie/db';
import { appLanguages, User } from '@movie/db/enums/base.enum';
import { AppConfig } from '../../common/config/app.config';
import { PlanResponseDto } from './plan.dto';
import { InferSelectModel, sql } from 'drizzle-orm';
import { __ } from '@app/helpers';

type Plan = InferSelectModel<typeof plans>;

@Injectable()
export class PlanService {
  constructor(
    @InjectDb() private readonly db: DataSource,
    private readonly config: AppConfig,
  ) {}

  async get(lang: appLanguages): Promise<PlanResponseDto[]> {
    const result = await this.db.query.plans.findMany({
      where: { isActive: true },
      orderBy: (plan, { asc }) => [
        asc(plan.sequence),
        /* @formatter:off */
        sql`COALESCE(${plan.title}->>${lang}, ${plan.title}->>${this.config.mainLang}) ASC`,
        /* @formatter:off */
      ],
    });

    return result.map((plan) => this.mapToResponseDto(plan, lang));
  }

  private mapToResponseDto(plan: Plan, lang: appLanguages): PlanResponseDto {
    return {
      id: plan.id,
      price: plan.price,
      title: plan.title[lang] ?? plan.title[this.config.mainLang] ?? '',
      discountPercent: plan.discountPercent,
      description:
        plan.description?.[lang] ??
        plan.description?.[this.config.mainLang] ??
        '',
      durationInDays: plan.durationInDays,
    };
  }

  async getUserSubscription(user: User): Promise<{ expiresAt: Date | null }> {
    const sub = await this.db.query.userSubscription.findFirst({
      where: { userId: user.id, expiresAt: { gte: new Date() } },
    });

    return {
      expiresAt: sub?.expiresAt ?? null,
    };
  }

  async subscribeToPlan(user: User, planId: string) {
    const plan = await this.db.query.plans.findFirst({
      where: { id: planId },
    });

    if (!plan?.id) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.subscription') }),
      );
    }

    const existing = await this.getUserSubscription(user);

    const now = new Date();
    let newExpiresAt: Date;

    if (existing.expiresAt !== null && existing.expiresAt > now) {
      newExpiresAt = new Date(existing.expiresAt);
    } else {
      newExpiresAt = now;
    }

    newExpiresAt.setDate(newExpiresAt.getDate() + plan.durationInDays);

    // 3. Upsert
    await this.db
      .insert(userSubscription)
      .values({
        userId: user.id,
        expiresAt: newExpiresAt,
      })
      .onConflictDoUpdate({
        target: userSubscription.userId,
        set: { expiresAt: newExpiresAt },
      });
  }
}
