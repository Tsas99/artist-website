import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateHomeMediaDto } from './dto/create-home-media.dto';
import { UpdateHomeMediaDto } from './dto/update-home-media.dto';
import { HomeMediaService } from './home-media.service';

@Controller('home-media')
export class HomeMediaController {
  constructor(
    private readonly homeMediaService:
      HomeMediaService,
  ) {}

  @Get()
  findAll() {
    return this.homeMediaService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.homeMediaService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createHomeMediaDto: CreateHomeMediaDto,
  ) {
    return this.homeMediaService.create(
      createHomeMediaDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateHomeMediaDto: UpdateHomeMediaDto,
  ) {
    return this.homeMediaService.update(
      id,
      updateHomeMediaDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.homeMediaService.remove(id);
  }
}