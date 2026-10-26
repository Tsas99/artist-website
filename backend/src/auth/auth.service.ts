
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';

const RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const RESET_COOLDOWN_MS = 60 * 1000;
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
      private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      email: admin.email,
      tokenVersion: admin.tokenVersion,
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
  }

  async changePassword(
    adminId: number,
    dto: ChangePasswordDto,
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'Admin account not found.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new BadRequestException(
        'Current password is incorrect.',
      );
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'New passwords do not match.',
      );
    }

    const samePassword = await bcrypt.compare(
      dto.newPassword,
      admin.passwordHash,
    );

    if (samePassword) {
      throw new BadRequestException(
        'New password must be different.',
      );
    }

    const newPasswordHash = await bcrypt.hash(
      dto.newPassword,
      12,
    );

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
        tokenVersion: { increment: 1 },
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    return {
      message:
        'Password updated successfully. Please sign in again.',
    };
  }

  private hashResetToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  

async requestPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();

  const genericResponse = {
    message:
      'If an admin account exists for this email, a password reset link will be sent.',
  };

  const admin = await this.prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return genericResponse;
  }

  const now = new Date();
  const cooldownCutoff = new Date(
    now.getTime() - RESET_COOLDOWN_MS,
  );

  const token = randomBytes(32).toString('hex');
  const tokenHash = this.hashResetToken(token);

  const expiresAt = new Date(
    now.getTime() + RESET_TOKEN_LIFETIME_MS,
  );

  // Atomically claim the cooldown.
  // Only one concurrent request can update this row.
  const claimed = await this.prisma.admin.updateMany({
    where: {
      id: admin.id,
      OR: [
        { resetRequestedAt: null },
        {
          resetRequestedAt: {
            lte: cooldownCutoff,
          },
        },
      ],
    },
    data: {
      resetRequestedAt: now,
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
    },
  });

  if (claimed.count !== 1) {
    return genericResponse;
  }

  try {
    await this.emailService.sendPasswordResetEmail(
      admin.email,
      token,
    );
  } catch {
    // Only clear the token created by this request.
    // Preserve the cooldown to avoid repeated email attempts.
    await this.prisma.admin.updateMany({
      where: {
        id: admin.id,
        resetTokenHash: tokenHash,
      },
      data: {
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    return genericResponse;
  }

  return genericResponse;
}


  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'New passwords do not match.',
      );
    }

    if (
      Buffer.byteLength(dto.newPassword, 'utf8') > 72
    ) {
      throw new BadRequestException(
        'Password must not exceed 72 UTF-8 bytes.',
      );
    }

    const tokenHash = this.hashResetToken(dto.token);

    const admin = await this.prisma.admin.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!admin) {
      throw new BadRequestException(
        'Invalid or expired password reset link.',
      );
    }

    const samePassword = await bcrypt.compare(
      dto.newPassword,
      admin.passwordHash,
    );

    if (samePassword) {
      throw new BadRequestException(
        'New password must be different.',
      );
    }

    const newPasswordHash = await bcrypt.hash(
      dto.newPassword,
      12,
    );

    const result = await this.prisma.admin.updateMany({
      where: {
        id: admin.id,
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
      data: {
        passwordHash: newPasswordHash,
        tokenVersion: { increment: 1 },
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        'Invalid or expired password reset link.',
      );
    }

    return {
      message:
        'Password reset successfully. Please sign in.',
    };
  }
}
