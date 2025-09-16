import { Injectable } from '@nestjs/common';
import { DataSource, InjectDb, reactions } from '@movie/db';
import { attachDetach, reactionType, User } from '@movie/db/enums/base.enum';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ReactionService {
  constructor(@InjectDb() private readonly db: DataSource) {}

  async attachDetach(
    user: User,
    titleId: string,
    type: reactionType,
    action: attachDetach,
  ) {
    const userId = user.id;
    if (action === attachDetach.DETACH) {
      return this.db
        .delete(reactions)
        .where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.titleId, titleId),
            eq(reactions.type, type),
          ),
        );
    }
    const oppositeType =
      type === reactionType.LIKE ? reactionType.DISLIKE : reactionType.LIKE;
    return await this.db.transaction(async (tx) => {
      await tx
        .delete(reactions)
        .where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.titleId, titleId),
            eq(reactions.type, oppositeType),
          ),
        );
      const exist = await tx.query.reactions.findFirst({
        where: { userId, titleId, type },
      });
      if (!exist) {
        await tx.insert(reactions).values({
          userId,
          titleId,
          type,
        });
      }
      return;
    });
  }
}
