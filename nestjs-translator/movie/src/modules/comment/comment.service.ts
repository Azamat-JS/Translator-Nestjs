import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { blockedWords, commentReactions, comments, DataSource, InjectDb } from '@movie/db';
import { and, desc, eq, InferInsertModel, isNull, sql } from 'drizzle-orm';
import {
  commentStatus,
  reactionType,
  User,
  attachDetach,
  wordSeverity,
  wordMatchMode,
} from '@movie/db/enums/base.enum';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto'
import { PaginationDto } from '../../../../admin/src/common/dto/pagination.dto';
import { from } from 'rxjs';
import { __ } from '@app/helpers';

@Injectable()
export class CommentService {
  constructor(@InjectDb() private readonly db: DataSource) {}

  async get(titleId: string, dto: PaginationDto) {
    const page = dto.page;
    const perPage = dto.perPage;
    const offset = (page - 1) * perPage;

    const total = await this.getTotal(titleId);
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

    const data = await this.getList(titleId, perPage, offset);

    return {
      data,
      current_page: page,
      per_page: perPage,
      total: total,
      has_next_page: false,
      has_previous_page: offset > 0,
    };
  }

  private async getList(titleId: string, perPage: number, offset: number) {
    return this.db
      .select({
        id: comments.id,
        user_name: comments.userName,
        content: comments.comment,
        created_at: comments.createdAt,
        updated_at: comments.updatedAt,
        status: comments.status,
        like_count: sql<number>`COUNT
          ( CASE WHEN ${commentReactions.type} = ${reactionType.LIKE} THEN 1 END)`,
        dislike_count: sql<number>`COUNT
          ( CASE WHEN ${commentReactions.type} = ${reactionType.DISLIKE} THEN 1 END)`,
        reply_count: sql<number>`(SELECT COUNT(*)
                                  FROM ${comments} c2
                                  WHERE c2.parent_id = ${comments.id}
                                    AND c2.status = ${commentStatus.APPROVED})`,
      })
      .from(comments)
      .leftJoin(commentReactions, eq(commentReactions.commentId, comments.id))
      .where(
        and(
          eq(comments.titleId, titleId),
          eq(comments.status, commentStatus.APPROVED),
          isNull(comments.parentId),
        ),
      )
      .groupBy(comments.id)
      .orderBy(
        desc(sql<number>`COUNT
          (CASE WHEN ${commentReactions.type} = ${reactionType.LIKE} THEN 1 END)`),
        desc(sql<number>`(SELECT COUNT(*)
                          FROM ${comments} c2
                          WHERE c2.parent_id = ${comments.id}
                            AND c2.status = ${commentStatus.APPROVED})`),
        desc(comments.createdAt),
      )
      .limit(perPage)
      .offset(offset);
  }

  private async getTotal(titleId: string): Promise<number> {
    const [totalResult] = await this.db
      /* @formatter:off */
      .select({ count: sql<number>`count(*)::int` })
      /* @formatter:on */
      .from(comments)
      .where(
        and(
          eq(comments.titleId, titleId),
          eq(comments.status, commentStatus.APPROVED),
          isNull(comments.parentId),
        ),
      );
    return totalResult?.count ?? 0;
  }

  async getChildren(commentId: string) {
    return this.db
      .select({
        id: comments.id,
        replyToUserName: comments.replyToUserName,
        content: comments.comment,
        userName: comments.userName,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        likeCount: sql<number>`COUNT
          (CASE WHEN ${commentReactions.type} = ${reactionType.LIKE} THEN 1 END)`,
        dislikeCount: sql<number>`COUNT
          (CASE WHEN ${commentReactions.type} = ${reactionType.DISLIKE} THEN 1 END)`,
      })
      .from(comments)
      .leftJoin(commentReactions, eq(commentReactions.commentId, comments.id))
      .where(
        and(
          eq(comments.parentId, commentId),
          eq(comments.status, commentStatus.APPROVED),
        ),
      )
      .groupBy(comments.id)
      .orderBy(comments.createdAt);
  }

  async createOrReply(dto: CreateCommentDto, userId: number) {
    const { moderated, severityFlag } = await this.moderateCommentText(
      dto.comment,
    );
    const status =
      severityFlag === wordSeverity.REMOVE
        ? commentStatus.REJECTED
        : commentStatus.APPROVED;

    type InsertComment = InferInsertModel<typeof comments>;

    const insertData: InsertComment = {
      titleId: dto.titleId,
      comment: moderated,
      userName: dto.userName,
      userId,
      status,
    };

    if (dto.commentId) {
      const parent = await this.db.query.comments.findFirst({
        where: { id: dto.commentId, titleId: dto.titleId },
      });

      if (!parent) {
        throw new NotFoundException(__('error.not_found', {name: __('attributes.comment')}));
      }
      insertData.parentId = parent.parentId ?? parent.id;
      if (parent.parentId) {
        insertData.replyToUserId = parent.userId;
        insertData.replyToUserName = parent.userName;
        insertData.replyToCommentId = parent.id;
      }
    }

    const [comment] = await this.db
      .insert(comments)
      .values(insertData)
      .returning();
    return comment;
  }

  async updateCommentOrReply(
    commentId: string,
    user: User,
    dto: UpdateCommentDto,
  ) {
    const existingComment = await this.db.query.comments.findFirst({
      where: { id: commentId },
    });
    if (!existingComment) {
      throw new NotFoundException(__('error.not_found', {name: __('attributes.comment')}));
    }
    if (existingComment.userId !== user.id) {
      throw new ForbiddenException(__('error.not_related', {name: __('attributes.comment')}));
    }
    if (!dto.comment) {
      throw new BadRequestException(__('error.required', {name: __('attributes.comment')}));
    }

    const { moderated, severityFlag } = await this.moderateCommentText(
      dto.comment,
    );
    const status =
      severityFlag === wordSeverity.REMOVE
        ? commentStatus.REJECTED
        : commentStatus.APPROVED;

    await this.db
      .update(comments)
      .set({
        comment: moderated,
        updatedAt: new Date(),
        status,
      })
      .where(eq(comments.id, commentId));
  }

  async attachDetach(
    user: User,
    commentId: string,
    type: reactionType,
    action: attachDetach,
  ) {
    const userId = user.id;
    if (action === attachDetach.DETACH) {
      return this.db
        .delete(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.type, type),
          ),
        );
    }
    const oppositeType =
      type === reactionType.LIKE ? reactionType.DISLIKE : reactionType.LIKE;
    return await this.db.transaction(async (tx) => {
      await tx
        .delete(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.type, oppositeType),
          ),
        );
      const exist = await tx.query.commentReactions.findFirst({
        where: { userId, commentId, type },
      });
      if (!exist) {
        await tx.insert(commentReactions).values({
          userId,
          commentId,
          type,
        });
      }
      return;
    });
  }

  async delete(commentId: string, user: User) {
    const comment = await this.db.query.comments.findFirst({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(__('error.not_found', {name: __('attributes.comment')}));
    }
    if (comment.userId !== user.id) {
      throw new ForbiddenException(__('error.not_related', {name: __('attributes.comment')}));
    }
    if (!comment.parentId) {
      await this.db.transaction(async (tx) => {
        await tx.delete(comments).where(eq(comments.parentId, comment.id));
        await tx.delete(comments).where(eq(comments.id, comment.id));
      });
    } else {
      await this.db.delete(comments).where(eq(comments.id, commentId));
    }
  }

  private async moderateCommentText(text: string) {
    const blocked = await this.db.query.blockedWords.findMany();
    let severityFlag: wordSeverity | null = null;
    let moderated = text;
  
    for (const bw of blocked) {
      const word = bw.word;
      const matchMode = bw.matchMode;
      const severity = bw.severity;
  
      let regex: RegExp;
      let replacer: (match: string, ...args: any[]) => string;
  
      // Use raw word unless it contains special characters
      const escapedWord = /[.*+?^${}()|[\]\\]/.test(word)
        ? word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        : word;
  
      switch (matchMode) {
        case wordMatchMode.EXACT:
          regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
          replacer = (match) => '*'.repeat(match.length);
          break;
  
        case wordMatchMode.PREFIX:
          regex = new RegExp(`\\b${escapedWord}\\w*`, 'gi');
          replacer = (match) => '*'.repeat(match.length);
          break;
  
        case wordMatchMode.SUFFIX:
          regex = new RegExp(`\\w*${escapedWord}\\b`, 'gi');
          replacer = (match) => '*'.repeat(match.length);
          break;
  
        case wordMatchMode.ANYWHERE:
        default:
          // Match word anywhere in another word (stupid → stupids, stupider, etc.)
          regex = new RegExp(`${escapedWord}\\w*`, 'gi');
          replacer = (match) => '*'.repeat(match.length);
          break;
      }
  
      // Log for debugging
      console.log(`🔍 Checking word: "${word}" | Mode: ${matchMode} | Regex: ${regex}`);
      console.log(`   🔹 Text before: "${moderated}"`);
      const match = moderated.match(regex);
      console.log(`   🔹 Match result:`, match);
  
      if (match) {
        if (severity === wordSeverity.REMOVE) {
          severityFlag = wordSeverity.REMOVE;
        }
  
        if (severity === wordSeverity.REPLACE) {
          moderated = moderated.replace(regex, replacer);
          console.log(`   ✅ Replaced. New text: "${moderated}"`);
        }
      }
    }
  
    return { moderated, severityFlag };
  }
  
}

//comment delete ni onDelete: 'cascade' qilish kerak,
//Patch so'rovi uchun dostup,
