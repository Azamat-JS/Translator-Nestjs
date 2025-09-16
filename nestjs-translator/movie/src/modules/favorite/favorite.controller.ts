import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RequestWithUser } from '../../common/types/request-with-user';
import { attachDetach } from '@movie/db/enums/base.enum';
import { TitleFilterDto } from '../title/title.dto';

@Controller('favorites')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('access-token')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  async get(@Req() req: RequestWithUser, @Query() filters: TitleFilterDto) {
    return await this.favoriteService.get(req, filters);
  }

  @Post(':titleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or import favorite (via request)' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  @ApiQuery({
    name: 'action',
    enum: attachDetach,
    required: true,
    description: 'Sevimlilarga qo‘shish (attach) yoki olib tashlash (detach)',
  })
  async toggle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    const action = req.query.action as attachDetach;
    await this.favoriteService.attachDetach(titleId, userId, action);

    return true;
  }
}
