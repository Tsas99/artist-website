import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('about')
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
  ) {}

  @Get()
  findOne() {
    return this.aboutService.findOne();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(
    @Body() updateAboutDto: UpdateAboutDto,
  ) {
    return this.aboutService.update(
      updateAboutDto,
    );
  }
}