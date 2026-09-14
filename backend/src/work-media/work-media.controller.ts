import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { WorkMediaService } from './work-media.service';
import { CreateWorkMediaDto } from './dto/create-work-media.dto';
import { UpdateWorkMediaDto } from './dto/update-work-media.dto';

@Controller('work-media')
export class WorkMediaController {
  constructor(
    private readonly workMediaService: WorkMediaService,
  ) {}

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