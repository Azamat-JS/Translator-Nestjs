import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TrailerService } from './trailer.service';
import { plainToInstance } from 'class-transformer';
import { TrailerResponseDto } from './trailer.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/types/request-with-user';

@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('title/:titleId/trailer')
export class TrailerController {
  constructor(private readonly trailerService: TrailerService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of trailer' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  async get(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Req() req: RequestWithUser,
  ) {
    const lang = req.lang;
    const trailers = await this.trailerService.get(titleId, lang);
    return plainToInstance(TrailerResponseDto, trailers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trailer by ID' })
  @ApiParam({ name: 'titleId', type: 'string', description: 'Title UUID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Trailer UUID' })
  async getById(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ) {
    const lang = req.lang;
    const trailer = await this.trailerService.getOne(titleId, id, lang);
    return plainToInstance(TrailerResponseDto, trailer);
  }
}
