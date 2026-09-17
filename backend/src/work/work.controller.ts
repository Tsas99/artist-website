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

import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('works')
export class WorkController {
  constructor(private readonly workService: WorkService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWorkDto: CreateWorkDto) {
    return this.workService.create(createWorkDto);
  }

  @Get()
  findAll() {
    return this.workService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.workService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    return this.workService.update(id, updateWorkDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workService.remove(id);
  }
  

}
