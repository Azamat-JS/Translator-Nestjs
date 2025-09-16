import { Expose, Transform } from 'class-transformer';
import { format } from 'date-fns';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PlanResponseDto {
  id: string;
  title: string;
  description: string | null;
  @Expose({ name: 'duration_in_days', toPlainOnly: true })
  durationInDays: number;
  price: number | null;
  @Expose({ name: 'discount_percent', toPlainOnly: true })
  discountPercent: number;
}

export class userSubscriptionResponseDto {
  @Expose({ name: 'expires_at', toPlainOnly: true })
  @Transform(
    ({ value }) =>
      value ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss') : null,
    { toPlainOnly: true },
  )
  expiresAt: Date | null;
}

export class SubscribeToPlanDto {
  @Expose({ name: 'plan_id', toPlainOnly: true })
  @ApiProperty({ name: 'plan_id' })
  @IsUUID('7', { each: true })
  planId: string;
}
