
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreatePressDto } from './dto/create-press.dto';
import { UpdatePressDto } from './dto/update-press.dto';

@Injectable()
export class PressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // CREATE PRESS
  // New entries are placed at the end.
  async create(createPressDto: CreatePressDto) {
    const { media, ...pressData } = createPressDto;

    const lastPress =
      await this.prisma.press.findFirst({
        orderBy: [
          { sortOrder: 'desc' },
          { id: 'desc' },
        ],
        select: {
          sortOrder: true,
        },
      });

    const nextSortOrder =
      (lastPress?.sortOrder ?? -1) + 1;

    return this.prisma.press.create({
      data: {
        ...pressData,
        sortOrder: nextSortOrder,

        media:
          media && media.length > 0
            ? {
                create: media.map(
                  (item, index) => ({
                    url: item.url,
                    publicId: item.publicId,
                    sortOrder:
                      item.sortOrder ?? index,
                  }),
                ),
              }
            : undefined,
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

  // GET ALL PRESS
  // Sorted by the custom admin order.
  async findAll() {
    return this.prisma.press.findMany({
      include: {
        media: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },

      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });
  }

  // GET PRESS BY ID
  async findOne(id: number) {
    const press =
      await this.prisma.press.findUnique({
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

    if (!press) {
      throw new NotFoundException(
        'Press entry not found.',
      );
    }

    return press;
  }

  // GET PRESS BY SLUG
  async findBySlug(slug: string) {
    const press =
      await this.prisma.press.findUnique({
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

    if (!press) {
      throw new NotFoundException(
        'Press entry not found.',
      );
    }

    return press;
  }

  // UPDATE PRESS
  async update(
    id: number,
    updatePressDto: UpdatePressDto,
  ) {
    await this.findOne(id);

    const { media, ...pressData } =
      updatePressDto;

    return this.prisma.press.update({
      where: {
        id,
      },

      data: {
        ...pressData,

        ...(media !== undefined
          ? {
              media: {
                deleteMany: {},

                create: media.map(
                  (item, index) => ({
                    url: item.url,
                    publicId: item.publicId,
                    sortOrder:
                      item.sortOrder ?? index,
                  }),
                ),
              },
            }
          : {}),
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

  // DELETE PRESS
  // Delete Cloudinary images before database entry.
  async remove(id: number) {
    const press =
      await this.prisma.press.findUnique({
        where: {
          id,
        },

        include: {
          media: true,
        },
      });

    if (!press) {
      throw new NotFoundException(
        'Press entry not found.',
      );
    }

    // Delete cover image.
    if (press.coverPublicId) {
      await this.uploadService.deleteMedia(
        press.coverPublicId,
        'image',
      );
    }

    // Delete gallery images.
    for (const media of press.media) {
      await this.uploadService.deleteMedia(
        media.publicId,
        'image',
      );
    }

    // Delete press entry.
    return this.prisma.press.delete({
      where: {
        id,
      },
    });
  }

  // REORDER PRESS
  // Save the exact order selected in Admin.
  async reorder(ids: number[]) {
    const uniqueIds = new Set(ids);

    if (
      ids.length === 0 ||
      uniqueIds.size !== ids.length
    ) {
      throw new BadRequestException(
        'Invalid press order.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const existing =
          await tx.press.findMany({
            select: {
              id: true,
            },
          });

        const existingIds = new Set(
          existing.map((entry) => entry.id),
        );

        if (
          existing.length !== ids.length ||
          ids.some(
            (id) => !existingIds.has(id),
          )
        ) {
          throw new BadRequestException(
            'Press order must contain all entries.',
          );
        }

        for (
          let index = 0;
          index < ids.length;
          index++
        ) {
          await tx.press.update({
            where: {
              id: ids[index],
            },

            data: {
              sortOrder: index,
            },
          });
        }

        return {
          success: true,
        };
      },
    );
  }
}
