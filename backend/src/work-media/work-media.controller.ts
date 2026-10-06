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

import { WorkMediaService } from './work-media.service';
import { CreateWorkMediaDto } from './dto/create-work-media.dto';
import { UpdateWorkMediaDto } from './dto/update-work-media.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  FileInterceptor,
} from '@nestjs/platform-express';

import type {
  UploadedMediaFile,
} from '../upload/upload.service';

@Controller('work-media')
@UseGuards(JwtAuthGuard)
export class WorkMediaController {
  constructor(
    private readonly workMediaService: WorkMediaService,
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
  @Body('workId', ParseIntPipe) workId: number,
  @UploadedFile() file?: UploadedMediaFile,
) {
  return this.workMediaService.uploadAndCreate(
    workId,
    file!,
  );
}

  @Post()
  create(
    @Body() createWorkMediaDto: CreateWorkMediaDto,
  ) {
    return this.workMediaService.create(
      createWorkMediaDto,
    );
  }

  @Get()
  findAll() {
    return this.workMediaService.findAll();
  }

  @Get('work/:workId')
  findByWork(
    @Param('workId', ParseIntPipe) workId: number,
  ) {
    return this.workMediaService.findByWork(workId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workMediaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkMediaDto: UpdateWorkMediaDto,
  ) {
    return this.workMediaService.update(
      id,
      updateWorkMediaDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workMediaService.remove(id);
  }
}