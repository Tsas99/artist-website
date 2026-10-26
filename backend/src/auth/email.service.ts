
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetEmail(
    recipientEmail: string,
    token: string,
  ): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!apiKey || !from || !frontendUrl) {
      this.logger.error(
        'Password reset email configuration is missing.',
      );

      throw new InternalServerErrorException(
        'Email service is unavailable.',
      );
    }

    const resend = new Resend(apiKey);

    const resetUrl = new URL(
      '/admin/reset-password',
      frontendUrl,
    );

    resetUrl.searchParams.set('token', token);

    
try {
  const { data, error } = await resend.emails.send({
    from,
    to: recipientEmail,
    subject: 'Reset your admin password',
    text: [
      'You requested a password reset for your artist website.',
      '',
      'Open this link to create a new password:',
      resetUrl.toString(),
      '',
      'This link expires in 15 minutes and can only be used once.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
  });

  if (error) {
    this.logger.error(
      `Password reset email rejected: ${error.name}`,
    );

    throw new Error('Resend rejected the request.');
  }

  if (!data?.id) {
    this.logger.error(
      'Password reset email returned no message ID.',
    );

    throw new Error('Missing email message ID.');
  }
} catch (error) {
  this.logger.error(
    'Password reset email request failed.',
  );

  throw new InternalServerErrorException(
    'Email service is unavailable.',
  );
}

  }
}
