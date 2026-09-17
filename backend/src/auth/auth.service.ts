import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email
      .trim()
      .toLowerCase();

    const admin =
      await this.prisma.admin.findUnique({
        where: {
          email,
        },
      });

    if (!admin) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        loginDto.password,
        admin.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: admin.id,
        email: admin.email,
      });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
  }
}