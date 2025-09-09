import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from 'src/interceptors/logger/logger.interceptor';

@Controller('users')
@UseInterceptors(LoggerInterceptor)
export class UsersController {

    @Get()
    getAll(){
        return [{id: 1, name: 'John'}, {id: 2, name: ""}]
    }
}
