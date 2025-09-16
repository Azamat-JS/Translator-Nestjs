
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentResponseDto {
  id: string;
  @Expose({ name: 'reply_to_user_name', toPlainOnly: true })
  replyToUserName: string;
  content: string;
  @Expose({ name: 'user_name', toPlainOnly: true })
  userName: string;
  @Expose({ name: 'like_count', toPlainOnly: true })
  @Transform(({ value }) => parseInt(value as string))
  likeCount: number;

  @Expose({ name: 'dislike_count', toPlainOnly: true })
  @Transform(({ value }) => parseInt(value as string))
  dislikeCount: number;

  @Expose({ name: 'reply_count', toPlainOnly: true })
  @Transform(({ value }) => parseInt(value as string))
  replyCount: number;

  @Expose({ name: 'created_at', toPlainOnly: true })
  createdAt: Date;
  @Expose({ name: 'updated_at', toPlainOnly: true })
  updatedAt: Date;
}

export class CreateCommentDto {
  @IsUUID()
  @ApiProperty({ name: 'title_id' })
  @Expose({ name: 'title_id', toPlainOnly: true })
  titleId: string;

  @IsString()
  @Length(1, 2000)
  @ApiProperty()
  comment: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ name: 'comment_id', type: 'string' })
  @Expose({ name: 'comment_id', toPlainOnly: true })
  commentId?: string | null;

  @IsString()
  @ApiProperty({ name: 'user_name' })
  @Expose({ name: 'user_name', toPlainOnly: true })
  userName: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  @ApiPropertyOptional()
  comment?: string;
}
