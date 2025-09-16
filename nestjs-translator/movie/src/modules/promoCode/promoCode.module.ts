import { Module } from '@nestjs/common';
import { PromoCodeController } from './promoCode.controller';
import { PromoCodeService } from './promoCode.service';

@Module({
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
})
export class PromoCodeModule {}
