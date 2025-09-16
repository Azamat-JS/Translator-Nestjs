import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { RequestWithUser } from '../../common/types/request-with-user';
import { attachDetach, reactionType } from '@movie/db/enums/base.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post(':titleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or Dislike' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
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
  async toggle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Request() req: RequestWithUser,
  ) {
    const action = req.query.action as attachDetach;
    const type = req.query.type as reactionType;
    await this.reactionService.attachDetach(req.user, titleId, type, action);

    return true;
  }
}
