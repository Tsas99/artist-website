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

import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';

@Controller('works')
export class WorkController {
  constructor(private readonly workService: WorkService) { }

  @Post()
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    return this.workService.update(id, updateWorkDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workService.remove(id);
  }
}
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   ParseIntPipe,
// } from '@nestjs/common';

// import { WorkService } from './work.service';
// import { CreateWorkDto } from './dto/create-work.dto';
// import { UpdateWorkDto } from './dto/update-work.dto';

// @Controller('works')
// export class WorkController {
//   constructor(private readonly workService: WorkService) { }
//   @Post()
//   create(@Body() CreateWorkDto: CreateWorkDto) {
//     return this.workService.create(CreateWorkDto);
//   }

//   @Get()
//   findAll() {
//     return this.workService.findAll();
//   }

//   @Get('slug/:slug')
//   findBySlug(@Param('slug') slug: string) {
//     return this.workService.findBySlug(slug);
//   }

//   @Get(':id')
//   findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.workService.findOne(id);
//   }

//   @Patch('id')
//   update(
//     @Param('id, ParseIntPipe') id: number,
//     @Body() updateWorkDto: UpdateWorkDto,
//   ) {
//     return this.workService.update(id, updateWorkDto);
//   }

//   @Delete(':id')
//   remove(@Param('id, ParseIntPipe') id: number) {
//     return this.workService.remove(id);
//   }


// }
