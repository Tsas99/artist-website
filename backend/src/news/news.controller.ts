
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
import { ReorderNewsDto } from './dto/reorder_news.dto';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
  ) {}

  // GET ALL NEWS
  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  // GET NEWS BY SLUG
  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
  ) {
    return this.newsService.findBySlug(slug);
  }

  // GET NEWS BY ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.newsService.findOne(id);
  }

  // CREATE NEWS
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createNewsDto: CreateNewsDto,
  ) {
    return this.newsService.create(
      createNewsDto,
    );
  }

  // REORDER NEWS
  // Keep this route before PATCH ':id'
  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  reorder(
    @Body() reorderNewsDto: ReorderNewsDto,
  ) {
    return this.newsService.reorder(
      reorderNewsDto.ids,
    );
  }

  // UPDATE NEWS
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

  // DELETE NEWS
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.newsService.remove(id);
  }
}
