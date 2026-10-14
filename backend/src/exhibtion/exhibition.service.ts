import {
    BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibtion.dto';
import type { UploadedMediaFile } from '../upload/upload.service';


@Injectable()
export class ExhibitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateExhibitionDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const last = await tx.exhibition.findFirst({
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        });

        const exhibition = await tx.exhibition.create({
          data: {
            name: dto.name,
            slug: dto.slug,
            curatorialText: dto.curatorialText,
            linkTitle: dto.linkTitle,
            link: dto.link || null,
            venue: dto.venue,
            location: dto.location,
            startDate: dto.startDate
              ? new Date(dto.startDate)
              : null,
            endDate: dto.endDate
              ? new Date(dto.endDate)
              : null,
            isPublished: dto.isPublished ?? false,
            sortOrder: (last?.sortOrder ?? -1) + 1,
          },
        });

        return tx.exhibition.findUnique({
          where: { id: exhibition.id },
          include: {
            media: {
              orderBy: { sortOrder: 'asc' },
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
          'An exhibition with this slug already exists.',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.exhibition.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found.');
    }

    return exhibition;
  }

  async findBySlug(slug: string) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { slug },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found.');
    }

    return exhibition;
  }

  async update(id: number, dto: UpdateExhibitionDto) {
    try {
      return await this.prisma.exhibition.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.curatorialText !== undefined && {
            curatorialText: dto.curatorialText,
          }),
          ...(dto.linkTitle !== undefined && {
              linkTitle: dto.linkTitle,
          }),

          ...(dto.link !== undefined && {
              link: dto.link || null,
          }),
        
          ...(dto.venue !== undefined && { venue: dto.venue }),
          ...(dto.location !== undefined && {
            location: dto.location,
          }),
          ...(dto.startDate !== undefined && {
            startDate: dto.startDate
              ? new Date(dto.startDate)
              : null,
          }),
          ...(dto.endDate !== undefined && {
            endDate: dto.endDate
              ? new Date(dto.endDate)
              : null,
          }),
          ...(dto.isPublished !== undefined && {
            isPublished: dto.isPublished,
          }),
        },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An exhibition with this slug already exists.',
          );
        }

        if (error.code === 'P2025') {
          throw new NotFoundException('Exhibition not found.');
        }
      }

      throw error;
    }
  }

  async reorder(ids: number[]) {
    const exhibitions = await this.prisma.exhibition.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (exhibitions.length !== ids.length) {
      throw new NotFoundException(
        'One or more exhibitions were not found.',
      );
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.exhibition.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.findAll();
  }
 
  async uploadCover(
    id: number,
    file?: UploadedMediaFile,
  ) {
    const exhibition =
      await this.prisma.exhibition.findUnique({
        where: { id },
        select: {
          id: true,
          coverPublicId: true,
        },
      });

    if (!exhibition) {
      throw new NotFoundException(
        'Exhibition not found.',
      );
    }

    if (!file) {
      throw new BadRequestException(
        'No poster image was uploaded.',
      );
    }

    const allowedImages = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedImages.includes(file.mimetype)) {
      throw new BadRequestException(
        'Poster must be JPG, PNG or WebP.',
      );
    }

    const uploaded =
      await this.uploadService.uploadMedia(file);

    try {
      await this.prisma.exhibition.update({
        where: { id },
        data: {
          coverUrl: uploaded.url,
          coverPublicId: uploaded.publicId,
        },
      });
    } catch (error) {
      try {
        await this.uploadService.deleteMedia(
          uploaded.publicId,
          'image',
        );
      } catch (cleanupError) {
        console.error(
          'Failed to clean up new poster:',
          cleanupError,
        );
      }

      throw error;
    }

    // Check whether the previous poster is still
    // referenced elsewhere before deleting it.
    const oldPublicId = exhibition.coverPublicId;

    if (
      oldPublicId &&
      oldPublicId !== uploaded.publicId
    ) {
      const [
        exhibitionCovers,
        exhibitionGallery,
        workCovers,
        workGallery,
        newsPosters,
        pressCovers,
        pressGallery,
        homeMedia,
        aboutProfiles,
      ] = await Promise.all([
        this.prisma.exhibition.count({
          where: { coverPublicId: oldPublicId },
        }),
        this.prisma.exhibitionMedia.count({
          where: { publicId: oldPublicId },
        }),
        this.prisma.work.count({
          where: { imagePublicId: oldPublicId },
        }),
        this.prisma.workMedia.count({
          where: { publicId: oldPublicId },
        }),
        this.prisma.news.count({
          where: { posterPublicId: oldPublicId },
        }),
        this.prisma.press.count({
          where: { coverPublicId: oldPublicId },
        }),
        this.prisma.pressMedia.count({
          where: { publicId: oldPublicId },
        }),
        this.prisma.homeMedia.count({
          where: { publicId: oldPublicId },
        }),
        this.prisma.about.count({
          where: { profileImagePublicId: oldPublicId },
        }),
      ]);

      const referenceCount =
        exhibitionCovers +
        exhibitionGallery +
        workCovers +
        workGallery +
        newsPosters +
        pressCovers +
        pressGallery +
        homeMedia +
        aboutProfiles;

      if (referenceCount === 0) {
        try {
          await this.uploadService.deleteMedia(
            oldPublicId,
            'image',
          );
        } catch (cleanupError) {
          // The new poster is already saved.
          // Do not report the whole upload as failed.
          console.error(
            'Old poster cleanup failed. Run media audit:',
            {
              oldPublicId,
              cleanupError,
            },
          );
        }
      }
    }

    return this.findOne(id);
  }
  async removeCover(id: number) {
  const exhibition = await this.findOne(id);

  if (!exhibition.coverPublicId) {
    return exhibition;
  }

  const oldPublicId = exhibition.coverPublicId;

  // Эхлээд database-аас cover холбоосыг салгана.
  await this.prisma.exhibition.update({
    where: { id },
    data: {
      coverUrl: null,
      coverPublicId: null,
    },
  });

  // Өөр хэсэгт ашиглагдаж байгаа эсэхийг шалгана.
  const counts = await Promise.all([
    this.prisma.exhibition.count({
      where: { coverPublicId: oldPublicId },
    }),
    this.prisma.exhibitionMedia.count({
      where: { publicId: oldPublicId },
    }),
    this.prisma.work.count({
      where: { imagePublicId: oldPublicId },
    }),
    this.prisma.workMedia.count({
      where: { publicId: oldPublicId },
    }),
    this.prisma.news.count({
      where: { posterPublicId: oldPublicId },
    }),
    this.prisma.press.count({
      where: { coverPublicId: oldPublicId },
    }),
    this.prisma.pressMedia.count({
      where: { publicId: oldPublicId },
    }),
    this.prisma.homeMedia.count({
      where: { publicId: oldPublicId },
    }),
    this.prisma.about.count({
      where: { profileImagePublicId: oldPublicId },
    }),
  ]);

  if (counts.every((count) => count === 0)) {
    try {
      await this.uploadService.deleteMedia(
        oldPublicId,
        'image',
      );
    } catch (error) {
      console.error(
        'Poster cleanup failed. Run media audit:',
        { oldPublicId, error },
      );
    }
  }

  return this.findOne(id);
}

  async remove(id: number) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found.');
    }

    const cloudinaryMedia = new Map<string, 'image' | 'video'>();

    if (exhibition.coverPublicId) {
      cloudinaryMedia.set(exhibition.coverPublicId, 'image');
    }

    for (const media of exhibition.media) {
      if (media.type !== 'image' && media.type !== 'video') {
        continue;
      }

      cloudinaryMedia.set(media.publicId, media.type);
    }

    for (const [publicId, type] of cloudinaryMedia) {
      await this.uploadService.deleteMedia(publicId, type);
    }

    return this.prisma.exhibition.delete({
      where: { id },
    });
  }
}