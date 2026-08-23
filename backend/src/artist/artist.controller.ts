import { Body, Controller, Get, Post } from '@nestjs/common';

import { ArtistService } from './artist.service';
import { Prisma } from '@prisma/client';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Post()
  create(@Body() data: Prisma.ArtistCreateInput) {
    return this.artistService.create(data);
  }

  @Get()
  findAll() {
    return this.artistService.findAll();
  }
}
