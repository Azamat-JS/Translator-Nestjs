import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateOrUpdateRatingDto } from './rating.dto';
import { RequestWithUser } from '../../common/types/request-with-user';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('ratings')
@ApiBearerAuth('access-token')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post(':titleId')
  @ApiOperation({ summary: 'create rating and comment' })
  async rating(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Body() dto: CreateOrUpdateRatingDto,
    @Request() req: RequestWithUser,
  ) {
    await this.ratingService.createOrUpdate(req.user.id, titleId, dto);

    return true;
  }
}
