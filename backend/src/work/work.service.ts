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

import { CreateWorkLinkDto } from './dto/create-work-link.dto';
import { UpdateWorkLinkDto } from './dto/update-work-link.dto';

@Injectable()
export class WorkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createWorkDto: CreateWorkDto) {
    const { media, ...workData } = createWorkDto;

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // Add a new project to the end
          // of the manually ordered list.
          const lastWork = await tx.work.findFirst({
            orderBy: {
              sortOrder: 'desc',
            },
            select: {
              sortOrder: true,
            },
          });

          const work = await tx.work.create({
            data: {
              ...workData,
              sortOrder:
                (lastWork?.sortOrder ?? -1) + 1,
            },
          });

          if (media?.length) {
            await tx.workMedia.createMany({
              data: media.map((item, index) => ({
                url: item.url,
                publicId: item.publicId,
                type: item.type,
                sortOrder:
                  item.sortOrder ?? index,
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
        },
      );
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
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
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        media: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        links: {
          orderBy: {
            sortOrder:'asc',
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const work =
      await this.prisma.work.findUnique({
        where: {
          id,
        },
        include: {
          media: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          links: {
          orderBy: {
            sortOrder:'asc',
          },
        },
        },
      });

    if (!work) {
      throw new NotFoundException(
        'Work not found.',
      );
    }

    return work;
  }

  async findBySlug(slug: string) {
    const work =
      await this.prisma.work.findUnique({
        where: {
          slug,
        },
        include: {
          media: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          links: {
          orderBy: {
            sortOrder:'asc',
          },
        },
        },
      });

    if (!work) {
      throw new NotFoundException(
        'Work not found.',
      );
    }

    return work;
  }

  async update(
    id: number,
    updateWorkDto: UpdateWorkDto,
  ) {
    const {
      media: _media,
      ...workData
    } = updateWorkDto;

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
          links: {
          orderBy: {
            sortOrder:'asc',
          },
        },
        },
      });
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
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

  async reorder(ids: number[]) {
    const works =
      await this.prisma.work.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

    if (works.length !== ids.length) {
      throw new NotFoundException(
        'One or more works were not found.',
      );
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.work.update({
          where: {
            id,
          },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );

    return this.findAll();
  }

  async remove(id: number) {
    const work =
      await this.prisma.work.findUnique({
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


    const cloudinaryMedia = new Map<
      string,
      'image' | 'video'
    >();

    // Cover image
    if (work.imagePublicId) {
      cloudinaryMedia.set(
        work.imagePublicId,
        'image',
      );
    }

    // Gallery images and videos
    for (const media of work.media) {
      if (
        media.type !== 'image' &&
        media.type !== 'video'
      ) {
        continue;
      }

      cloudinaryMedia.set(
        media.publicId,
        media.type,
      );
    }

    // Delete every unique Cloudinary asset.
    for (const [
      publicId,
      type,
    ] of cloudinaryMedia) {
      await this.uploadService.deleteMedia(
        publicId,
        type,
      );
    }


    return this.prisma.work.delete({
      where: {
        id,
      },
    });
  }
  
  async addLink(
    workId: number,
    dto: CreateWorkLinkDto,
  ) {
    await this.findOne(workId);

    const lastLink = await this.prisma.workLink.findFirst({
      where: { workId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return this.prisma.workLink.create({
      data: {
        label: dto.label,
        url: dto.url,
        workId,
        sortOrder:
          dto.sortOrder ??
          (lastLink?.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateLink(
    workId: number,
    linkId: number,
    dto: UpdateWorkLinkDto,
  ) {
    const link = await this.prisma.workLink.findFirst({
      where: {
        id: linkId,
        workId,
      },
    });

    if (!link) {
      throw new NotFoundException('Work link not found.');
    }

    return this.prisma.workLink.update({
      where: { id: linkId },
      data: dto,
    });
  }

  async removeLink(
    workId: number,
    linkId: number,
  ) {
    const link = await this.prisma.workLink.findFirst({
      where: {
        id: linkId,
        workId,
      },
    });

    if (!link) {
      throw new NotFoundException('Work link not found.');
    }

    return this.prisma.workLink.delete({
      where: { id: linkId },
    });
  }

}