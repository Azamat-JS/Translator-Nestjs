import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';

@Controller()
export class UserController {
  constructor(@Inject('USER-SERVICE') private readonly userClient:ClientProxy) {}


  @UseGuards(AuthGuard)
  @Get('user')
  async getUserProfile(@Req() req){
    const userId = req.user.userId
    const user$ = this.userClient.send('get-user-profile', userId);
    return await firstValueFrom(user$)
  }
}
