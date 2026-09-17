import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

type JwtPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class JwtAuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest<Request>();

    const token =
      this.extractTokenFromHeader(
        request,
      );

    if (!token) {
      throw new UnauthorizedException(
        'Authentication required.',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
          {
            secret:
              process.env.JWT_SECRET,
          },
        );

      (
        request as Request & {
          user?: JwtPayload;
        }
      ).user = payload;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token.',
      );
    }

    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(
        ' ',
      ) ?? [];

    return type === 'Bearer'
      ? token
      : undefined;
  }
}