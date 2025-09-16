import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, InjectDb, rating, titles } from '@movie/db';
import { CreateOrUpdateRatingDto } from './rating.dto';
import { avg, count, eq } from 'drizzle-orm';
import { __ } from '@app/helpers';

@Injectable()
export class RatingService {
  constructor(@InjectDb() private readonly db: DataSource) {}

  async createOrUpdate(
    userId: number,
    titleId: string,
    dto: CreateOrUpdateRatingDto,
  ) {
    const titleExists = await this.db.query.titles.findFirst({
      where: {
        id: titleId,
      },
    });

    if (!titleExists) {
      throw new NotFoundException(
        __('error.not_found', { name: __('attributes.title') }),
      );
    }

    await this.db
      .insert(rating)
      .values({
        titleId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      })
      .onConflictDoUpdate({
        target: [rating.titleId, rating.userId],
        set: {
          rating: dto.rating,
          comment: dto.comment,
        },
      });

    const titleAvg = await this.db
      .select({
        value: avg(rating.rating),
        votes: count(rating.rating),
      })
      .from(rating)
      .where(eq(rating.titleId, titleId));

    const avgValueRaw = parseFloat(titleAvg[0]?.value ?? '0');
    const avgValue = parseFloat(avgValueRaw.toFixed(2));
    const votesCount = titleAvg[0]?.votes ?? 0;

    await this.db
      .update(titles)
      .set({
        avgRating: {
          rating: avgValue,
          votes: votesCount,
        },
      })
      .where(eq(titles.id, titleId));
  }
}
