import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Request,
} from '@nestjs/common';
import { PromoCodeService } from './promoCode.service';
import { RequestWithUser } from '../../common/types/request-with-user';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsePromoCodeDto } from './promoCode.dto';
import { __ } from '@app/helpers';

@ApiBearerAuth('access-token')
@Controller('promo_codes')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Post('use')
  @ApiOperation({ summary: 'Use Promo Code' })
  async rating(@Body() dto: UsePromoCodeDto, @Request() req: RequestWithUser) {
    throw new NotFoundException(
      __('error.not_found', { name: __('attributes.promo_code') }),
    );

    return {
      //todo success structure
      message: 'Sizga 7 kunlik obuna taqdim etildi',
    };
  }
}
