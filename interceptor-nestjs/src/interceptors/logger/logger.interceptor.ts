import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Request started...')
    const start = Date.now()
    return next.handle().pipe(tap(() => console.log(`Request  completed in ${Date.now() - start}ms`)));
  }
}
