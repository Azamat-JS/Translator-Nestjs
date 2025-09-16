import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { plainToInstance } from 'class-transformer';
import { BannerResponseDto } from './banner.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/types/request-with-user';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('banners')
@ApiBearerAuth('access-token')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async get(@Req() req: RequestWithUser) {
    const lang = req.lang;
    const banners = await this.bannerService.get(lang);
    return plainToInstance(BannerResponseDto, banners);
  }
}
