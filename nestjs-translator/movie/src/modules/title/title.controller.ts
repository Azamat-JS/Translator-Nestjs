import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TitleService } from './title.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TitleFilterDto, TitleResponseDto } from './title.dto';
import { RequestWithUser } from '../../common/types/request-with-user';

@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('titles')
export class TitleController {
  constructor(private readonly titleService: TitleService) {}

  @Post()
  async get(@Req() req: RequestWithUser, @Body() filters: TitleFilterDto) {
    console.log(filters);
    return await this.titleService.get(req, filters);
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ) {
    const title = await this.titleService.getOne(id, req.user, req.lang);
    return plainToInstance(TitleResponseDto, title);
  }

  @Get('/slug/:slug')
  async getOneBySlug(@Param('slug') slug: string, @Req() req: RequestWithUser) {
    const title = await this.titleService.getOneBySlug(
      slug,
      req.user,
      req.lang,
    );
    return plainToInstance(TitleResponseDto, title);
  }

  @Get('/franchise/:franchiseId/titles')
  async getByFranchiseTitles(
    @Param('franchiseId', ParseUUIDPipe) franchiseId: string,
    @Req() req: RequestWithUser,
  ) {
    const titles = await this.titleService.getByFranchiseTitles(
      franchiseId,
      req,
    );
    return plainToInstance(TitleResponseDto, titles);
  }
}
