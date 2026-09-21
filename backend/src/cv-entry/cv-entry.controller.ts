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
import { CvEntryService } from './cv-entry.service';
import { CreateCvEntryDto } from './dto/create-cv-entry.dto';
import { UpdateCvEntryDto } from './dto/update-cv-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cv')
export class CvEntryController {
  constructor(
    private readonly cvEntryService: CvEntryService,
  ) {}

  @Get()
  findAll() {
    return this.cvEntryService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cvEntryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCvEntryDto: CreateCvEntryDto,
  ) {
    return this.cvEntryService.create(
      createCvEntryDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvEntryDto: UpdateCvEntryDto,
  ) {
    return this.cvEntryService.update(
      id,
      updateCvEntryDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cvEntryService.remove(id);
  }
}