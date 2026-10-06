import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

import { CreateWorkMediaDto } from './dto/create-work-media.dto';
import { UpdateWorkMediaDto } from './dto/update-work-media.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import type { UploadedMediaFile } from '../upload/upload.service';

@Injectable()
export class WorkMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async uploadAndCreate(
  workId: number,
  file: UploadedMediaFile,
) {
  // 1. Verify the Work exists before uploading.
  const work = await this.prisma.work.findUnique({
    where: {
      id: workId,
    },
    select: {
      id: true,
    },
  });

  if (!work) {
    throw new NotFoundException(
      'Work not found.',
    );
  }

  if (!file) {
    throw new BadRequestException(
      'No file was uploaded.',
    );
  }

  // 2. Upload to Cloudinary.
  // UploadService already handles Sharp optimization.
  const uploaded =
    await this.uploadService.uploadMedia(file);

  // 3. Save to PostgreSQL.
  try {
    const lastMedia =
      await this.prisma.workMedia.findFirst({
        where: {
          workId,
        },
        orderBy: [
          {
            sortOrder: 'desc',
          },
          {
            id: 'desc',
          },
        ],
        select: {
          sortOrder: true,
        },
      });

    return await this.prisma.workMedia.create({
      data: {
        workId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: uploaded.type,
        sortOrder:
          (lastMedia?.sortOrder ?? -1) + 1,
      },
    });
  } catch (databaseError) {
    // 4. Database save failed:
    // attempt to remove the newly uploaded asset.
    console.error(
      'WorkMedia database save failed:',
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
          {
            publicId: uploaded.publicId,
            result: cleanupResult,
          },
        );
      }
    } catch (cleanupError) {
      console.error(
        'Cloudinary cleanup failed. Manual review required:',
        {
          publicId: uploaded.publicId,
          type: uploaded.type,
          cleanupError,
        },
      );
    }

    throw new InternalServerErrorException(
      'Media could not be saved.',
    );
  }
}

  create(createWorkMediaDto: CreateWorkMediaDto) {
    return this.prisma.workMedia.create({
      data: createWorkMediaDto,
    });
  }

  findAll() {
    return this.prisma.workMedia.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  findByWork(workId: number) {
    return this.prisma.workMedia.findMany({
      where: {
        workId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.workMedia.findUnique({
      where: {
        id,
      },
    });
  }

  update(
    id: number,
    updateWorkMediaDto: UpdateWorkMediaDto,
  ) {
    return this.prisma.workMedia.update({
      where: {
        id,
      },
      data: updateWorkMediaDto,
    });
  }

  async remove(id: number) {
    // 1. Find media and its parent work.
    const media =
      await this.prisma.workMedia.findUnique({
        where: {
          id,
        },
        include: {
          work: true,
        },
      });

    if (!media) {
      throw new NotFoundException(
        'Media not found.',
      );
    }

    // 2. Check whether this is the cover.
    const isCover =
      media.type === 'image' &&
      (
        media.work.imagePublicId ===
          media.publicId ||
        media.work.imageUrl === media.url
      );

    // 3. Find a replacement cover if needed.
    let replacementCover: {
      url: string;
      publicId: string;
    } | null = null;

    if (isCover) {
      const nextImage =
        await this.prisma.workMedia.findFirst({
          where: {
            workId: media.workId,
            id: {
              not: media.id,
            },
            type: 'image',
          },
          orderBy: [
            {
              sortOrder: 'asc',
            },
            {
              id: 'asc',
            },
          ],
          select: {
            url: true,
            publicId: true,
          },
        });

      replacementCover = nextImage;
    }

    // 4. Delete the Cloudinary asset.
    if (
      media.type === 'image' ||
      media.type === 'video'
    ) {
      await this.uploadService.deleteMedia(
        media.publicId,
        media.type,
      );
    }

    // 5. Update database records together.
    return this.prisma.$transaction(
      async (tx) => {
        if (isCover) {
          await tx.work.update({
            where: {
              id: media.workId,
            },
            data: {
              imageUrl:
                replacementCover?.url ?? null,

              imagePublicId:
                replacementCover?.publicId ?? null,
            },
          });
        }

        return tx.workMedia.delete({
          where: {
            id: media.id,
          },
        });
      },
    );
  }
}