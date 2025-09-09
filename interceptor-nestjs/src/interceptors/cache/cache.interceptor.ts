import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map()
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = request.url;

    if(this.cache.has(key)){
      console.log("Returning cached response.")
      return new Observable((observer) => {
        observer.next(this.cache.get(key));
        observer.complete()
      }
    )
    }
    return next.handle().pipe(map((response)=> {
      this.cache.set(key, response); 
      return response;
    }));
  }
}
