import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class WorkService {
  constructor(private readonly prisma: PrismaService,
              private readonly uploadService: UploadService
  ) {}

  async create(createWorkDto: CreateWorkDto) {
    const { media, ...workData } = createWorkDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const work = await tx.work.create({
          data: workData,
        });

        if (media?.length) {
          await tx.workMedia.createMany({
            data: media.map((item, index) => ({
              url: item.url,
              publicId: item.publicId,
              type: item.type,
              sortOrder: item.sortOrder ?? index,
              workId: work.id,
            })),
          });
        }

        return tx.work.findUnique({
          where: {
            id: work.id,
          },
          include: {
            media: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A work with this slug already exists.',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.work.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        media: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const work = await this.prisma.work.findUnique({
      where: {
        id,
      },
      include: {
        media: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!work) {
      throw new NotFoundException('Work not found.');
    }

    return work;
  }

  async findBySlug(slug: string) {
    const work = await this.prisma.work.findUnique({
      where: {
        slug,
      },
      include: {
        media: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!work) {
      throw new NotFoundException('Work not found.');
    }

    return work;
  }

  async update(
    id: number,
    updateWorkDto: UpdateWorkDto,
  ) {
    const { media, ...workData } = updateWorkDto;

    try {
      return await this.prisma.work.update({
        where: {
          id,
        },
        data: workData,
        include: {
          media: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A work with this slug already exists.',
          );
        }

        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Work not found.',
          );
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    const work = await this.prisma.work.findUnique({
        where: {
            id,
        },
        include: {
            media: true,
        },
    });

    if (!work) {
        throw new NotFoundException(
            'Work not found.',
        );
    }

    for (const media of work.media) {
        if (
            media.type !== 'image' &&
            media.type !== 'video'
        ) {
            continue;
        }

        await this.uploadService.deleteMedia(
            media.publicId,
            media.type,
        );
    }

    return this.prisma.work.delete({
        where: {
            id,
        },
    });
}
}