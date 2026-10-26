
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  Throttle,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { JwtAuthGuard } from './jwt-auth.guard';

import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: {
    sub: number;
    email: string;
    tokenVersion: number;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // LOGIN
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 5,
      ttl: 15 * 60 * 1000,
    },
  })
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  // CURRENT ADMIN
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      id: request.user.sub,
      email: request.user.email,
    };
  }

  // CHANGE PASSWORD
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user.sub,
      dto,
    );
  }

  // FORGOT PASSWORD
  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 15 * 60 * 1000,
    },
  })
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.requestPasswordReset(
      dto.email,
    );
  }

  // RESET PASSWORD
  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 5,
      ttl: 15 * 60 * 1000,
    },
  })
  resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }
}
