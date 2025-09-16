import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GenreResponseDto } from './genre.dto';
import { GenreService } from './genre.service';
import { plainToInstance } from 'class-transformer';
import { RequestWithUser } from '../../common/types/request-with-user';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('genres')
@ApiBearerAuth('access-token')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async get(@Req() req: RequestWithUser, @Query('limit') limit?: number) {
    const lang = req.lang;
    const genres = await this.genreService.get(lang, limit);
    return plainToInstance(GenreResponseDto, genres);
  }
}
