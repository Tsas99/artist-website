import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { EmailService } from './email.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
     ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 5,
      },
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '8h',
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    EmailService,
    JwtAuthGuard,
    ThrottlerGuard,
  ],

  exports: [
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}