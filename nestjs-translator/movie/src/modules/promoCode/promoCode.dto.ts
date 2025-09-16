import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UsePromoCodeDto {
  @ApiProperty({ name: 'promo_code', example: 'PROMO123' })
  @IsString()
  @Expose({ name: 'promo_code', toPlainOnly: true })
  promoCode: string;
}
