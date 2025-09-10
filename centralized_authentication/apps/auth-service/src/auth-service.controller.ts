import { Controller, Get } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

 @MessagePattern('auth-login')
 async login(@Payload() credential: {username:string, password: string}){
  return this.authServiceService.login(credential)
 }

 @MessagePattern('validate-token')
 async validateToken(@Payload() token: string){
  return this.authServiceService.validateToken(token);
 }
}
