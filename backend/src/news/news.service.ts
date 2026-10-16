
import {
  BadRequestException,
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

  // CREATE
  async create(createNewsDto: CreateNewsDto) {
    return this.prisma.$transaction(async (tx) => {
      const lastNews = await tx.news.findFirst({
        orderBy: [
          { sortOrder: 'desc' },
          { id: 'desc' },
        ],
        select: {
          sortOrder: true,
        },
      });

      return tx.news.create({
        data: {
          ...createNewsDto,
          sortOrder: (lastNews?.sortOrder ?? -1) + 1,
        },
      });
    });
  }

  // GET ALL - SORTED
  findAll() {
    return this.prisma.news.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });
  }

  // GET ONE
  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException(
        'News not found.',
      );
    }

    return news;
  }

  // GET BY SLUG
  async findBySlug(slug: string) {
    const news = await this.prisma.news.findUnique({
      where: { slug },
    });

    if (!news) {
      throw new NotFoundException(
        'News not found.',
      );
    }

    return news;
  }

  // UPDATE
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

  // REORDER
  async reorder(ids: number[]) {
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some(
        (id) => !Number.isInteger(id) || id <= 0,
      ) ||
      new Set(ids).size !== ids.length
    ) {
      throw new BadRequestException(
        'Invalid news order.',
      );
    }

    const totalNews = await this.prisma.news.count();

    if (ids.length !== totalNews) {
      throw new BadRequestException(
        'The news order must include all entries.',
      );
    }

    const existingNews =
      await this.prisma.news.findMany({
        where: {
          id: { in: ids },
        },
        select: {
          id: true,
        },
      });

    if (existingNews.length !== ids.length) {
      throw new NotFoundException(
        'One or more news entries were not found.',
      );
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.news.update({
          where: { id },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );

    return this.findAll();
  }

  // DELETE
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
