import { Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from 'src/interceptors/cache/cache.interceptor';
import { ErrorInterceptor } from 'src/interceptors/error/error.interceptor';
import { LoggerInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { TransformInterceptor } from 'src/interceptors/transform/transform.interceptor';

@Controller('users')
export class UsersController {
    
    @Get()
    // @UseInterceptors(CacheInterceptor)
    getAll(){
        return [{id: 1, name: 'John'}, {id: 2, name: "Alex"}]
    }

    @Post()
    @UseInterceptors(ErrorInterceptor)
    createUser(){
        throw new Error('simple error')
    }
}
