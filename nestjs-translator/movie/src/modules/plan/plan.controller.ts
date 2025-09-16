import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { plainToInstance } from 'class-transformer';
import {
  PlanResponseDto,
  SubscribeToPlanDto,
  userSubscriptionResponseDto,
} from './plan.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/types/request-with-user';

@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all plan' })
  async getPlans(@Req() req: RequestWithUser) {
    const plans = await this.planService.get(req.lang);
    return plainToInstance(PlanResponseDto, plans);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe user to a plan' })
  async subscribeToPlan(
    @Body() body: SubscribeToPlanDto,
    @Req() req: RequestWithUser,
  ) {
    await this.planService.subscribeToPlan(req.user, body.planId);

    return plainToInstance(
      userSubscriptionResponseDto,
      this.planService.getUserSubscription(req.user),
    );
  }

  @Get('user/subscription')
  @ApiOperation({ summary: 'Get user subscription' })
  async getUserSubscription(@Req() req: RequestWithUser) {
    return plainToInstance(
      userSubscriptionResponseDto,
      this.planService.getUserSubscription(req.user),
    );
  }
}
