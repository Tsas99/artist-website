import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('contact')
export class ContactController {
    constructor(
        private readonly contactService: ContactService,
    ) {}
    @Post()
    @UseGuards(ThrottlerGuard)
    @Throttle({
        default:{
            limit:5,
            ttl: 600000,
        },
    })
    sendMessage(
        @Body() createContactDto: CreateContactDto,
    ) {
        return this.contactService.sendMessage(
            createContactDto,
        );
    }

}
