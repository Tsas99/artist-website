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

import { PressService } from './press.service';
import { CreatePressDto } from './dto/create-press.dto';
import { UpdatePressDto } from './dto/update-press.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('press')
export class PressController {
    constructor(
        private readonly pressService: PressService,
    ) {}

    @Get()
    findAll() {
        return this.pressService.findAll();
    }

    @Get('slug/:slug')
    findBySlug(
        @Param('slug') slug: string,
    ) {
        return this.pressService.findBySlug(
            slug,
        );
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.pressService.findOne(
            id,
        );
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @Body()
        createPressDto: CreatePressDto,
    ) {
        return this.pressService.create(
            createPressDto,
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        updatePressDto: UpdatePressDto,
    ) {
        return this.pressService.update(
            id,
            updatePressDto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.pressService.remove(
            id,
        );
    }
}