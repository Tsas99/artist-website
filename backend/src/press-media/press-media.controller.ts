import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PressMediaService } from './press-media.service';
import { CreatePressMediaDto } from './dto/create-press-media.dto';
import { UpdatePressMediaDto } from './dto/update-press-media.dto';

@Controller('press-media')
export class PressMediaController {
    constructor(
        private readonly pressMediaService: PressMediaService,
    ) {}
    @Post()
    create(
        @Body()
        createPressMediaDto:CreatePressMediaDto,
    ) {
        return this.pressMediaService.create(
            createPressMediaDto,
        );
    }
    @Get()
    findAll() {
        return this.pressMediaService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.pressMediaService.findOne(
            id,
        );
    }
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        updatePressMediaDto: UpdatePressMediaDto,
    ) {
        return this.pressMediaService.update(
            id,
            updatePressMediaDto,
        );
    }
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id:number,
    ) {
        return this.pressMediaService.remove(
            id,
        );
    }
    
}
