
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


import type { UploadedMediaFile } from '../upload/upload.service';
import { ExhibitionMediaService } from './exhibtion-media.service';

@Controller('exhibition-media')
@UseGuards(JwtAuthGuard)
export class ExhibitionMediaController {
  constructor(
    private readonly exhibitionMediaService: ExhibitionMediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  uploadAndCreate(
    @Body('exhibitionId', ParseIntPipe) exhibitionId: number,
    @UploadedFile() file?: UploadedMediaFile,
  ) {
    return this.exhibitionMediaService.uploadAndCreate(
      exhibitionId,
      file,
    );
  }

  @Get()
  findAll() {
    return this.exhibitionMediaService.findAll();
  }

  @Get('exhibition/:exhibitionId')
  findByExhibition(
    @Param('exhibitionId', ParseIntPipe) exhibitionId: number,
  ) {
    return this.exhibitionMediaService.findByExhibition(
      exhibitionId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exhibitionMediaService.findOne(id);
  }

  @Patch(':id')
  updateSortOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { sortOrder: number },
  ) {
    if (
      !Number.isInteger(body.sortOrder) ||
      body.sortOrder < 0
    ) {
      throw new BadRequestException(
        'sortOrder must be a non-negative integer.',
      );
    }

    return this.exhibitionMediaService.updateSortOrder(
      id,
      body.sortOrder,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exhibitionMediaService.remove(id);
  }
}
