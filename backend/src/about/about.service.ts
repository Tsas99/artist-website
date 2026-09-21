import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAboutDto } from './dto/update-about.dto';

@Injectable()
export class AboutService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findOne() {
    return this.prisma.about.findFirst({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async update(updateAboutDto: UpdateAboutDto) {
    const about = await this.findOne();

    if (!about) {
      return this.prisma.about.create({
        data: {
          artistStatement: updateAboutDto.artistStatement ?? '',
          profileImageUrl: updateAboutDto.profileImageUrl ?? null,
          profileImagePublicId: updateAboutDto.profileImagePublicId ?? null,
        },
      });
    }

    return this.prisma.about.update({
      where: {
        id: about.id,
      },
      data: updateAboutDto,
    });
  }
}