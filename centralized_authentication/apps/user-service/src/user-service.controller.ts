import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @MessagePattern('get-user-profile')
  getUserProfile(@Payload() userId:string){
    return this.userServiceService.getUserProfile(userId)
  }
}
