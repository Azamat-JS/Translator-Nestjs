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
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';
import { plainToInstance } from 'class-transformer';
import { RequestWithUser } from '../../common/types/request-with-user';
import { EpisodeQueryDto, EpisodeResponseDto } from './episode.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('episodes')
@ApiBearerAuth('access-token')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get('title/:titleId/episodes')
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  async get(
    @Req() req: RequestWithUser,
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Query() dto: EpisodeQueryDto,
  ) {
    const episodes = await this.episodeService.get(
      titleId,
      dto,
      req.user,
      req.lang,
    );
    return plainToInstance(EpisodeResponseDto, episodes);
  }

  @Get('title/:titleId/seasons')
  @ApiOperation({ summary: 'Get episodes seasons' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  async getGroupedBySeason(@Param('titleId', ParseUUIDPipe) titleId: string) {
    return await this.episodeService.getGroupedBySeason(titleId);
  }

  @Get('title/:titleId/episodes/:episodeId')
  @ApiOperation({ summary: 'Get episode by ID' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  @ApiParam({ name: 'episodeId', type: 'string', description: 'Episode UUID' })
  async getById(
    @Req() req: RequestWithUser,
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    const lang = req.lang;
    const episode = await this.episodeService.getOne(titleId, episodeId, lang);
    return plainToInstance(EpisodeResponseDto, episode);
  }
}
