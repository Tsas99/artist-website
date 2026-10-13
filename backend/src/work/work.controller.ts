
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
import { ReorderWorksDto } from './dto/reorder-works.dto';

import { CreateWorkLinkDto } from './dto/create-work-link.dto';
import { UpdateWorkLinkDto } from './dto/update-work-link.dto';

@Controller('works')
export class WorkController {
  constructor(
    private readonly workService: WorkService,
  ) {}

  // CREATE WORK
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWorkDto: CreateWorkDto) {
    return this.workService.create(createWorkDto);
  }

  // GET ALL WORKS
  @Get()
  findAll() {
    return this.workService.findAll();
  }

  // GET WORK BY SLUG
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.workService.findBySlug(slug);
  }

  // GET WORK BY ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workService.findOne(id);
  }

  // REORDER WORKS
  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(
    @Body() reorderWorksDto: ReorderWorksDto,
  ) {
    return this.workService.reorder(
      reorderWorksDto.ids,
    );
  }

  // UPDATE WORK
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    return this.workService.update(
      id,
      updateWorkDto,
    );
  }

  // ADD LINK TO WORK
  @Post(':id/links')
  @UseGuards(JwtAuthGuard)
  addLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateWorkLinkDto,
  ) {
    return this.workService.addLink(id, dto);
  }

  // UPDATE WORK LINK
  @Patch(':id/links/:linkId')
  @UseGuards(JwtAuthGuard)
  updateLink(
    @Param('id', ParseIntPipe) id: number,
    @Param('linkId', ParseIntPipe) linkId: number,
    @Body() dto: UpdateWorkLinkDto,
  ) {
    return this.workService.updateLink(
      id,
      linkId,
      dto,
    );
  }

  // DELETE WORK LINK
  @Delete(':id/links/:linkId')
  @UseGuards(JwtAuthGuard)
  removeLink(
    @Param('id', ParseIntPipe) id: number,
    @Param('linkId', ParseIntPipe) linkId: number,
  ) {
    return this.workService.removeLink(
      id,
      linkId,
    );
  }

  // DELETE WORK
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workService.remove(id);
  }
}
