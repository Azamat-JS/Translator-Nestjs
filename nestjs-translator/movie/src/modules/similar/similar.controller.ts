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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SimilarService } from './similar.service';
import { RequestWithUser } from '../../common/types/request-with-user';
import { TitleListResponseDto } from '../title/title.dto';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('similar')
@ApiBearerAuth('access-token')
export class SimilarController {
  constructor(private readonly similarService: SimilarService) {}

  @Get(':titleId')
  @ApiQuery({ name: 'limit', required: true, type: Number })
  async getSimilar(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Req() req: RequestWithUser,
    @Query('limit') limit: number,
  ) {
    const lim = Number(limit) || 10;
    const items = await this.similarService.getSimilar(titleId, lim, req);
    return plainToInstance(TitleListResponseDto, items);
  }
}
