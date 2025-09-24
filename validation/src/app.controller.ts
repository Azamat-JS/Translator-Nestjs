import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataValidatorDto } from './app.dto';
import { plainToInstance } from 'class-transformer';

const user = {
  email_address: 'user@gmail.com',
  user_name: 'umid',
  externalSecret: 'secret',
  internalSecret: 'innersecret',
  isMarried: false
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUser() {
  return plainToInstance(DataValidatorDto, user);
  }

  @Post()
  create(@Body() data: any) {
  const info =  plainToInstance(DataValidatorDto, data, {excludeExtraneousValues:true})
  console.log(info)
  return {
    user: info.userName,
    email: info.emailAddress,
    exSecret: info.externalSecret,
    inSecret: info.internalSecret,
    marry: info.isMarried
  }
  }
}
