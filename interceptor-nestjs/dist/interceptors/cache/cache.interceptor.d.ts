import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class CacheInterceptor implements NestInterceptor {
    private cache;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
