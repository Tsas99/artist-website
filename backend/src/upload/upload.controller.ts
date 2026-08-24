import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { UploadedImageFile } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: UploadedImageFile) {
    return this.uploadService.uploadImage(file);
  }
  @Delete('image')
  async deleteImage(@Body('publicId') publicId: string) {
    return this.uploadService.deleteImage(publicId);
  }
}