import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../types';

// SSE connections cannot send custom headers (EventSource limitation),
// so this guard also accepts a ?token= query parameter.
@Injectable()
export class SseJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers['authorization'];
    const queryToken = req.query['token'] as string | undefined;
    const raw = authHeader ? authHeader.split(' ')[1] : queryToken;

    if (!raw) throw new UnauthorizedException('No token');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(raw, {
        secret: process.env.JWT_SECRET,
      });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}
