import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthServiceService {
constructor(private jwtService: JwtService){}
  async login(credential: {username:string, password:string}){
    if(credential.username === 'admin' && credential.password === 'password'){
      const payload = {sub: '123', username: credential.username, role: 'admin'}
      const token = this.jwtService.sign(payload)
      return {token};
    }
    throw new UnauthorizedException('Invalid credentials')
  }
}
