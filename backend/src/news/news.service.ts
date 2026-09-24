import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateNewsDto } from './dto/create_news.dto';
import { UpdateNewsDto } from './dto/update_news.dto';


@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  create(createNewsDto: CreateNewsDto) {
    return this.prisma.news.create({
      data: createNewsDto,
    });
  }

  findAll() {
    return this.prisma.news.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const news =
      await this.prisma.news.findUnique({
        where: { id },
      });

    if (!news) {
      throw new NotFoundException(
        'News not found.',
      );
    }

    return news;
  }

  async findBySlug(slug: string) {
    const news =
      await this.prisma.news.findUnique({
        where: { slug },
      });

    if (!news) {
      throw new NotFoundException(
        'News not found.',
      );
    }

    return news;
  }

  async update(
    id: number,
    updateNewsDto: UpdateNewsDto,
  ) {
    await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: updateNewsDto,
    });
  }

  async remove(id: number) {
    const news = await this.findOne(id);

    if (
      news.posterPublicId &&
      news.posterUrl
    ) {
      await this.uploadService.deleteMedia(
        news.posterPublicId,
        'image',
      );
    }

    return this.prisma.news.delete({
      where: { id },
    });
  }
}