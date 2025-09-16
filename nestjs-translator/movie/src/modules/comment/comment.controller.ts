import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Request,
    UseInterceptors,
  } from '@nestjs/common';
  import { CommentService } from './comment.service';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
  } from '@nestjs/swagger';
  import { plainToInstance } from 'class-transformer';
  import {
    CommentResponseDto,
    CreateCommentDto,
    UpdateCommentDto,
  } from './comment.dto';
  import { RequestWithUser } from '../../common/types/request-with-user';
  import { attachDetach, reactionType } from '@movie/db/enums/base.enum';
  import { PaginationDto } from '../../../../admin/src/common/dto/pagination.dto';
  
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('comments')
  @ApiBearerAuth('access-token')
  export class CommentController {
    constructor(private readonly commentService: CommentService) {}
  
    @Get(':titleId')
    @ApiOperation({ summary: 'Get all comments by titleId' })
    @ApiParam({ name: 'titleId', description: 'title UUID' })
    async getCommentById(
      @Param('titleId', ParseUUIDPipe) id: string,
      @Query() dto: PaginationDto,
    ) {
      return await this.commentService.get(id, dto);
    }
  
    @Get(':id/replies')
    @ApiOperation({ summary: 'Get comments by replies' })
    @ApiParam({ name: 'id', type: 'string', description: 'Comment UUID' })
    async getChildren(@Param('id', ParseUUIDPipe) id: string) {
      const replies = await this.commentService.getChildren(id);
      return plainToInstance(CommentResponseDto, replies);
    }
  
    @Post()
    @ApiOperation({ summary: 'Create or reply comment' })
    async create(@Body() dto: CreateCommentDto, @Request() req: RequestWithUser) {
      const createComment = await this.commentService.createOrReply(
        dto,
        req.user.id,
      );
  
      return plainToInstance(CommentResponseDto, createComment);
    }
  
    @Post(':id/reaction')
    @ApiOperation({ summary: 'Like or Dislike' })
    @ApiParam({ name: 'id', type: 'string', description: 'Comment UUID' })
    @ApiQuery({
      name: 'type',
      enum: reactionType,
      required: true,
      description: 'Foydalanuvchi reaksiyasi: like yoki dislike',
    })
    @ApiQuery({
      name: 'action',
      enum: attachDetach,
      required: true,
      description: 'attach: qo‘shish, detach: o‘chirish',
    })
    async likeDislike(
      @Param('id', ParseUUIDPipe) id: string,
      @Request() req: RequestWithUser,
    ) {
      const action = req.query.action as attachDetach;
      const type = req.query.type as reactionType;
      await this.commentService.attachDetach(req.user, id, type, action);
  
      return true;
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update comment or reply (only owner)' })
    @ApiParam({ name: 'id', type: 'string', description: 'Comment UUID' })
    async updateComment(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateCommentDto,
      @Request() req: RequestWithUser,
    ) {
      await this.commentService.updateCommentOrReply(id, req.user, dto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete comment (only owner, cascades replies)' })
    @ApiParam({ name: 'id', type: 'string', description: 'Comment UUID' })
    async delete(
      @Param('id', ParseUUIDPipe) id: string,
      @Request() req: RequestWithUser,
    ) {
      return this.commentService.delete(id, req.user);
    }
  }