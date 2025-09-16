// common/interceptors/header.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/app.config';
import { HeadersEnum } from '@movie/db/enums/base.enum';
import { ApiHeader } from '@nestjs/swagger'; // adjust the path

@Injectable()
@ApiHeader({
  name: HeadersEnum.X_APP_LANG,
})
export class HeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    request.deviceType = request.headers[HeadersEnum.X_DEVICE_TYPE] ?? null;
    request.deviceModel = request.headers[HeadersEnum.X_DEVICE_MODEL] ?? null;
    request.deviceId = request.headers[HeadersEnum.X_DEVICE_ID] ?? null;
    request.appVersion = request.headers[HeadersEnum.X_APP_VERSION] ?? null;
    request.appBuild = request.headers[HeadersEnum.X_APP_BUILD] ?? null;
    request.firebaseToken = request.headers[HeadersEnum.FIREBASE_TOKEN] ?? null;
    request.lang =
      request.headers[HeadersEnum.X_APP_LANG] ?? new AppConfig().mainLang;

    if (process.env.REQUEST_LOG === 'true') {
      console.log(`[REQUEST] ${request.method} ${request.originalUrl}`);
    }

    return next.handle();
  }
}
