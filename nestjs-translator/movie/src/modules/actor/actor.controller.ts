import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ActorService } from './actor.service';
import { plainToInstance } from 'class-transformer';
import { ActorResponseDto } from './actor.dto';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/types/request-with-user';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('actors')
@ApiBearerAuth('access-token')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async get(
    @Req() req: RequestWithUser,
    @Query('search') search?: string,
    @Query('limit') limit?: number, //param
  ) {
    const actorsList = await this.actorService.get(req, search, limit);
    return plainToInstance(ActorResponseDto, actorsList);
  }

  @Get('title/:titleId')
  @ApiParam({ name: 'titleId', description: 'Title ID to get actors for' })
  async getByTitleId(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Req() req: RequestWithUser,
  ) {
    const actorsList = await this.actorService.getByTitleId(req, titleId);
    return plainToInstance(ActorResponseDto, actorsList);
  }

  @Get(':actorId')
  async getOne(
    @Param('actorId', ParseUUIDPipe) actorId: string,
    @Req() req: RequestWithUser,
  ) {
    const lang = req.lang;
    const actor = await this.actorService.getOne(actorId, lang);
    return plainToInstance(ActorResponseDto, actor);
  }
}
