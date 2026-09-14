import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';
import type { UploadedMediaFile } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) {}

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  async uploadMedia(
    @UploadedFile() file?: UploadedMediaFile,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file was uploaded.',
      );
    }

    return this.uploadService.uploadMedia(file);
  }

  @Delete('media')
  async deleteMedia(
    @Body('publicId') publicId: string,
    @Body('type') type: 'image' | 'video',
  ) {
    if (!publicId) {
      throw new BadRequestException(
        'publicId is required.',
      );
    }

    if (type !== 'image' && type !== 'video') {
      throw new BadRequestException(
        'Invalid media type.',
      );
    }

    return this.uploadService.deleteMedia(
      publicId,
      type,
    );
  }
}