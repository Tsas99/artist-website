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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
} from '@nestjs/platform-express';

import type { UploadedMediaFile } from '../upload/upload.service';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';

import { ReorderExhibitionsDto } from './dto/reorder-exhibitions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateExhibitionDto } from './dto/update-exhibtion.dto';

@Controller('exhibitions')
export class ExhibitionController {
  constructor(
    private readonly exhibitionService: ExhibitionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateExhibitionDto) {
    return this.exhibitionService.create(dto);
  }

  @Get()
  findAll() {
    return this.exhibitionService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.exhibitionService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionService.findOne(id);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 30 * 1024 * 1024,
      },
    }),
  )
  uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: UploadedMediaFile,
  ) {
    return this.exhibitionService.uploadCover(
      id,
      file,
    );
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() dto: ReorderExhibitionsDto) {
    return this.exhibitionService.reorder(dto.ids);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExhibitionDto,
  ) {
    return this.exhibitionService.update(id, dto);
  }
  
  @Delete(':id/cover')
  @UseGuards(JwtAuthGuard)
  removeCover(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exhibitionService.removeCover(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionService.remove(id);
  }
}