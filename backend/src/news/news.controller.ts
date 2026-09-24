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

import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create_news.dto';
import { UpdateNewsDto } from './dto/update_news.dto';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
  ) {}

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
  ) {
    return this.newsService.findBySlug(
      slug,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.newsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createNewsDto: CreateNewsDto,
  ) {
    return this.newsService.create(
      createNewsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.update(
      id,
      updateNewsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.newsService.remove(id);
  }
}