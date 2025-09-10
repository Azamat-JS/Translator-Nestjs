import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class AppController {
  constructor(@Inject('AUTH-SERVICE') private readonly authClient:ClientProxy) {}

  @Post('login')
  async login(@Body() body: {username:string, password: string}){
    try {
      const res = await firstValueFrom(this.authClient.send('auth-login', body))
      return res;
    } catch (error) {
      console.log(error.message)
    }
  }
}
