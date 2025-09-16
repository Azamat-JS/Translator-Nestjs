import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../types/request-with-user';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { __ } from '@app/helpers';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException(
        __('error.required', { name: __('attributes.token') }),
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify<{ sub: number }>(token);
      request.user = {
        id: Number(decoded.sub),
      };
      return true;
    } catch (err) {
      console.error('Token verification error:', err);
      throw new UnauthorizedException(
        __('error.invalid', { name: __('attributes.token') }),
      );
    }
  }
}
