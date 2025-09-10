import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthServiceService {

  async login(credential: {username:string, password:string}){
    if(credential.username === 'admin' && credential.password === 'password'){
      
    }
  }
}
