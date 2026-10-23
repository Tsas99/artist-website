
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

type JwtPayload = {
  sub: number;
  email: string;
  tokenVersion: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Authentication required.',
      );
    }

    let payload: JwtPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
          {
            secret: process.env.JWT_SECRET,
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token.',
      );
    }

    if (
      !Number.isInteger(payload.sub) ||
      !Number.isInteger(payload.tokenVersion)
    ) {
      throw new UnauthorizedException(
        'Invalid token payload.',
      );
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        tokenVersion: true,
      },
    });

    if (
      !admin ||
      admin.tokenVersion !== payload.tokenVersion ||
      admin.email !== payload.email
    ) {
      throw new UnauthorizedException(
        'Session is no longer valid.',
      );
    }

    (
      request as Request & {
        user?: JwtPayload;
      }
    ).user = payload;

    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer'
      ? token
      : undefined;
  }
}
