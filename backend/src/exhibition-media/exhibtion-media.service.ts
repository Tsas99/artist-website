import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  UploadService,
  type UploadedMediaFile,
} from '../upload/upload.service';

@Injectable()
export class ExhibitionMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // Upload image/video and save to database.
  async uploadAndCreate(
    exhibitionId: number,
    file?: UploadedMediaFile,
  ) {
    const exhibition =
      await this.prisma.exhibition.findUnique({
        where: { id: exhibitionId },
        select: { id: true },
      });

    if (!exhibition) {
      throw new NotFoundException(
        'Exhibition not found.',
      );
    }

    if (!file) {
      throw new BadRequestException(
        'No file was uploaded.',
      );
    }

    const uploaded =
      await this.uploadService.uploadMedia(file);

    try {
      const lastMedia =
        await this.prisma.exhibitionMedia.findFirst({
          where: { exhibitionId },
          orderBy: [
            { sortOrder: 'desc' },
            { id: 'desc' },
          ],
          select: { sortOrder: true },
        });

      return await this.prisma.exhibitionMedia.create({
        data: {
          exhibitionId,
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: uploaded.type,
          sortOrder:
            (lastMedia?.sortOrder ?? -1) + 1,
        },
      });
    } catch (databaseError) {
      console.error(
        'ExhibitionMedia database save failed:',
        databaseError,
      );

      try {
        const cleanupResult =
          await this.uploadService.deleteMedia(
            uploaded.publicId,
            uploaded.type,
          );

        if (
          cleanupResult?.result !== 'ok' &&
          cleanupResult?.result !== 'not found'
        ) {
          console.error(
            'Cloudinary cleanup returned an unexpected result:',
            cleanupResult,
          );
        }
      } catch (cleanupError) {
        console.error(
          'Cloudinary cleanup failed:',
          {
            publicId: uploaded.publicId,
            cleanupError,
          },
        );
      }

      throw new InternalServerErrorException(
        'Exhibition media could not be saved.',
      );
    }
  }

  // Get all gallery media.
  findAll() {
    return this.prisma.exhibitionMedia.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'asc' },
      ],
    });
  }

  // Get gallery media for one exhibition.
  findByExhibition(exhibitionId: number) {
    return this.prisma.exhibitionMedia.findMany({
      where: { exhibitionId },
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const media =
      await this.prisma.exhibitionMedia.findUnique({
        where: { id },
      });

    if (!media) {
      throw new NotFoundException(
        'Exhibition media not found.',
      );
    }

    return media;
  }

  // Update gallery order.
  async updateSortOrder(
    id: number,
    sortOrder: number,
  ) {
    return this.prisma.exhibitionMedia.update({
      where: { id },
      data: { sortOrder },
    });
  }

  // Delete image/video and protect exhibition cover.
  async remove(id: number) {
    const media =
      await this.prisma.exhibitionMedia.findUnique({
        where: { id },
        include: { exhibition: true },
      });

    if (!media) {
      throw new NotFoundException(
        'Exhibition media not found.',
      );
    }

    const isCover =
      media.type === 'image' &&
      (
        media.exhibition.coverPublicId ===
          media.publicId ||
        media.exhibition.coverUrl === media.url
      );

    let replacementCover: {
      url: string;
      publicId: string;
    } | null = null;

    if (isCover) {
      replacementCover =
        await this.prisma.exhibitionMedia.findFirst({
          where: {
            exhibitionId: media.exhibitionId,
            id: { not: media.id },
            type: 'image',
          },
          orderBy: [
            { sortOrder: 'asc' },
            { id: 'asc' },
          ],
          select: {
            url: true,
            publicId: true,
          },
        });
    }

    if (
      media.type === 'image' ||
      media.type === 'video'
    ) {
      await this.uploadService.deleteMedia(
        media.publicId,
        media.type,
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        if (isCover) {
          await tx.exhibition.update({
            where: {
              id: media.exhibitionId,
            },
            data: {
              coverUrl:
                replacementCover?.url ?? null,
              coverPublicId:
                replacementCover?.publicId ?? null,
            },
          });
        }

        return tx.exhibitionMedia.delete({
          where: { id },
        });
      },
    );
  }
}