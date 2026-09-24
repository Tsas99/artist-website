import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

import { CreateHomeMediaDto } from './dto/create-home-media.dto';
import { UpdateHomeMediaDto } from './dto/update-home-media.dto';

@Injectable()
export class HomeMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  create(
    createHomeMediaDto: CreateHomeMediaDto,
  ) {
    return this.prisma.homeMedia.create({
      data: createHomeMediaDto,
    });
  }

  findAll() {
    return this.prisma.homeMedia.findMany({
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const media =
      await this.prisma.homeMedia.findUnique({
        where: { id },
      });

    if (!media) {
      throw new NotFoundException(
        'Home media not found.',
      );
    }

    return media;
  }

  async update(
    id: number,
    updateHomeMediaDto: UpdateHomeMediaDto,
  ) {
    await this.findOne(id);

    return this.prisma.homeMedia.update({
      where: { id },
      data: updateHomeMediaDto,
    });
  }

  async remove(id: number) {
    const media = await this.findOne(id);

    await this.uploadService.deleteMedia(
      media.publicId,
      'image',
    );

    return this.prisma.homeMedia.delete({
      where: { id },
    });
  }
}