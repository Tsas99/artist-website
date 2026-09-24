import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { Resend } from 'resend';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
    private readonly resend: Resend;

    constructor() {
        this.resend = new Resend(
            process.env.RESEND_API_KEY,
        );
    }

    async sendMessage(
        createContactDto: CreateContactDto,
    ) {
        const {
            name,
            email,
            subject,
            message,
            website,
        } = createContactDto;

        if (website?.trim()) {
            console.warn(
              'Contact spam blocked by honeypot.',
            );

             return {
               success: true,
               message: 'Message sent.',
             };
        }

        console.log(
           'HONEYPOT PASSED — sending email',
        );

        const contactEmail =
            process.env.CONTACT_EMAIL;

        if (!contactEmail) {
            throw new InternalServerErrorException(
                'Contact email is not configured.',
            );
        }

        try {
            const { data, error } =
                await this.resend.emails.send({
                    from: 'Artist Website <onboarding@resend.dev>',

                    to: [contactEmail],

                    replyTo: email,

                    subject:
                        subject?.trim() ||
                        `New website message from ${name}`,

                    text: [
                        `Name: ${name}`,
                        `Email: ${email}`,
                        '',
                        'Message:',
                        message,
                    ].join('\n'),
                });

            if (error) {
                console.error(
                    'Resend email error:',
                    error,
                );

                throw new InternalServerErrorException(
                    'Failed to send message.',
                );
            }

            console.log(
                'Contact email sent:',
                data?.id,
            );
           

            return {
                success: true,
                message: 'Message sent.',
            };
        } catch (error) {
            console.error(
                'Contact email send failed:',
                error,
            );

            if (
                error instanceof
                InternalServerErrorException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to send message.',
            );
        }
    }
}