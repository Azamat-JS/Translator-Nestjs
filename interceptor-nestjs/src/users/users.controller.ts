import { Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from 'src/interceptors/logger/logger.interceptor';

@Controller('users')
export class UsersController {
    
    @Get()
    @UseInterceptors(LoggerInterceptor)
    getAll(){
        return [{id: 1, name: 'John'}, {id: 2, name: "Alex"}]
    }

    @Post()
    createUser(){
        return 'This creates a user'
    }
}
