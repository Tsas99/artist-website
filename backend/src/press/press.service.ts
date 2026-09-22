import {
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

    async create(
        createPressDto: CreatePressDto,
    ) {
        const {
            media,
            ...pressData
        } = createPressDto;

        return this.prisma.press.create({
            data: {
                ...pressData,

                media:
                    media &&
                    media.length > 0
                        ? {
                              create:
                                  media.map(
                                      (
                                          item,
                                          index,
                                      ) => ({
                                          url: item.url,
                                          publicId:
                                              item.publicId,
                                          sortOrder:
                                              item.sortOrder ??
                                              index,
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

    async findAll() {
        return this.prisma.press.findMany({
            include: {
                media: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: number) {
        const press =
            await this.prisma.press.findUnique({
                where: {
                    id,
                },
                include: {
                    media: {
                        orderBy: {
                            sortOrder:
                                'asc',
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

    async findBySlug(slug: string) {
        const press =
            await this.prisma.press.findUnique({
                where: {
                    slug,
                },
                include: {
                    media: {
                        orderBy: {
                            sortOrder:
                                'asc',
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

    async update(
        id: number,
        updatePressDto: UpdatePressDto,
    ) {
        await this.findOne(id);

        const {
            media,
            ...pressData
        } = updatePressDto;

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
                              create:
                                  media.map(
                                      (
                                          item,
                                          index,
                                      ) => ({
                                          url: item.url,
                                          publicId:
                                              item.publicId,
                                          sortOrder:
                                              item.sortOrder ??
                                              index,
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

        if (press.coverPublicId) {
            await this.uploadService.deleteMedia(
                press.coverPublicId,
                'image',
            );
        }

        for (const media of press.media) {
            await this.uploadService.deleteMedia(
                media.publicId,
                'image',
            );
        }

        return this.prisma.press.delete({
            where: {
                id,
            },
        });
    }
}