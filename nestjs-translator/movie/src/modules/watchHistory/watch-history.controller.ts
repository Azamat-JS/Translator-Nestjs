import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { WatchHistoryDto } from './watch-history.dto';
import { RequestWithUser } from '../../common/types/request-with-user';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '../../dto/pagination.dto';
import { WatchHistoryService } from './watch-history.service';

@Controller()
@Injectable()
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post('watch-history')
  async createOrUpdate(
    @Req() req: RequestWithUser,
    @Body() dto: WatchHistoryDto,
  ) {
    await this.watchHistoryService.createOrUpdate(req, dto);

    return true;
  }

  @Get('continue-watching')
  async getContinueWatching(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.watchHistoryService.getWatchHistoryData(
      req,
      paginationDto,
      true,
    );
  }

  @Get('watch-history')
  async getWatchHistory(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.watchHistoryService.getWatchHistoryData(
      req,
      paginationDto,
      false,
    );
  }

  @ApiOperation({ summary: 'Delete a film from watch history' })
  @Delete('delete-watch-history/:id')
  async deleteWatchHistory(@Param('id') id: string) {
    await this.watchHistoryService.deleteWatchHistory(id);

    return true;
  }
}
