import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Don't wrap if the response is already in error format
        if (data && data.success === false) {
          return data;
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
