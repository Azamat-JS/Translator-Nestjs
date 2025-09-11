import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, of } from 'rxjs';
import { HttpException } from '@nestjs/common';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        let status = 500;
        let message = 'Internal server error';

        if (err instanceof HttpException) {
          status = err.getStatus();
          const response = err.getResponse();
          message = typeof response === 'string' ? response : (response as any).message;
        }

        return of({
          success: false,
          statusCode: status,
          message,
        });
      }),
    );
  }
}
