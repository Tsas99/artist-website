import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { v2 as cloudinary } from 'cloudinary';

import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

type CloudinaryAsset = {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
};

async function main() {
  const app = await NestFactory.createApplicationContext(
    AppModule,
    {
      logger: ['error'],
    },
  );

  const prisma = app.get(PrismaService);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    // =====================================================
    // 1. READ ALL DATABASE MEDIA REFERENCES
    // =====================================================

    const [
      works,
      workMedia,
      about,
      press,
      pressMedia,
      homeMedia,
      news,
      exhibitions,
      exhibitionMedia,
    ] = await Promise.all([
      prisma.work.findMany({
        select: {
          imagePublicId: true,
          imageUrls: true,
        },
      }),

      prisma.workMedia.findMany({
        select: {
          publicId: true,
        },
      }),

      prisma.about.findMany({
        select: {
          profileImagePublicId: true,
        },
      }),

      prisma.press.findMany({
        select: {
          coverPublicId: true,
        },
      }),

      prisma.pressMedia.findMany({
        select: {
          publicId: true,
        },
      }),

      prisma.homeMedia.findMany({
        select: {
          publicId: true,
        },
      }),

      prisma.news.findMany({
        select: {
          posterPublicId: true,
        },
      }),

      prisma.exhibition.findMany({
        select:{
          coverPublicId: true,
        },
      }),

      prisma.exhibitionMedia.findMany({
        select:{
          publicId:true,
        },
      }),
    ]);

    // =====================================================
    // 2. BUILD SET OF PUBLIC IDS USED BY DATABASE
    // =====================================================

    const usedPublicIds = new Set<string>();

    function addPublicId(
      publicId: string | null | undefined,
    ) {
      if (publicId) {
        usedPublicIds.add(publicId);
      }
    }

    works.forEach((item) => {
      addPublicId(item.imagePublicId);
    });

    workMedia.forEach((item) => {
      addPublicId(item.publicId);
    });

    about.forEach((item) => {
      addPublicId(item.profileImagePublicId);
    });

    press.forEach((item) => {
      addPublicId(item.coverPublicId);
    });

    pressMedia.forEach((item) => {
      addPublicId(item.publicId);
    });

    homeMedia.forEach((item) => {
      addPublicId(item.publicId);
    });

    news.forEach((item) => {
      addPublicId(item.posterPublicId);
    });

    exhibitions.forEach((item) => {
      addPublicId(item.coverPublicId);
    });

    exhibitionMedia.forEach((item) => {
      addPublicId(item.publicId);
    });

    // =====================================================
    // 3. PROTECT LEGACY Work.imageUrls
    // =====================================================

    const legacyImageUrls = new Set<string>();

    works.forEach((work) => {
      work.imageUrls.forEach((url) => {
        if (url) {
          legacyImageUrls.add(url);
        }
      });
    });

    // =====================================================
    // 4. READ CLOUDINARY ASSETS
    // =====================================================

    async function getResources(
      resourceType: 'image' | 'video',
    ): Promise<CloudinaryAsset[]> {
      const resources: CloudinaryAsset[] = [];

      let nextCursor: string | undefined;

      do {
        const result =
          await cloudinary.api.resources({
            type: 'upload',
            resource_type: resourceType,
            prefix: 'artist-website/',
            max_results: 500,
            next_cursor: nextCursor,
          });

        for (const resource of result.resources) {
          resources.push({
            public_id: resource.public_id,
            secure_url: resource.secure_url,
            resource_type: resourceType,
          });
        }

        nextCursor = result.next_cursor;
      } while (nextCursor);

      return resources;
    }

    const [images, videos] = await Promise.all([
      getResources('image'),
      getResources('video'),
    ]);

    const cloudinaryAssets: CloudinaryAsset[] = [
      ...images,
      ...videos,
    ];

    const cloudinaryPublicIds = new Set(
      cloudinaryAssets.map(
        (asset) => asset.public_id,
      ),
    );

    // =====================================================
    // 5. SAFETY CHECK:
    // DB MUST NOT CONTAIN BROKEN PUBLIC IDS
    // =====================================================

    const missingFromCloudinary = [
      ...usedPublicIds,
    ].filter(
      (publicId) =>
        !cloudinaryPublicIds.has(publicId),
    );

    if (missingFromCloudinary.length > 0) {
      console.error('');
      console.error(
        'CLEANUP CANCELLED.',
      );

      console.error(
        'Some database publicIds are missing from Cloudinary:',
      );

      missingFromCloudinary.forEach(
        (publicId) => {
          console.error(`- ${publicId}`);
        },
      );

      console.error('');
      console.error(
        'Nothing was deleted.',
      );

      process.exitCode = 1;
      return;
    }

    // =====================================================
    // 6. CALCULATE ORPHANS
    // =====================================================

    const orphanCandidates =
      cloudinaryAssets.filter((asset) => {
        if (
          usedPublicIds.has(asset.public_id)
        ) {
          return false;
        }

        if (
          legacyImageUrls.has(asset.secure_url)
        ) {
          return false;
        }

        return true;
      });

    console.log('');
    console.log(
      '========================================',
    );
    console.log(
      '       ORPHAN MEDIA CLEANUP',
    );
    console.log(
      '========================================',
    );
    console.log('');

    console.log(
      `Cloudinary assets before cleanup: ${cloudinaryAssets.length}`,
    );

    console.log(
      `Unique DB publicIds: ${usedPublicIds.size}`,
    );

    console.log(
      `Protected legacy imageUrls: ${legacyImageUrls.size}`,
    );

    console.log(
      `Orphans to delete: ${orphanCandidates.length}`,
    );

    if (orphanCandidates.length === 0) {
      console.log('');
      console.log(
        'No orphan media found. Nothing to delete.',
      );
      return;
    }

    console.log('');
    console.log(
      'Deleting orphan media...',
    );
    console.log('');

    // =====================================================
    // 7. DELETE ORPHANS ONE BY ONE
    // =====================================================

    let deletedCount = 0;
    let notFoundCount = 0;
    let failedCount = 0;

    for (const asset of orphanCandidates) {
      try {
        const result =
          await cloudinary.uploader.destroy(
            asset.public_id,
            {
              resource_type:
                asset.resource_type,
              type: 'upload',
              invalidate: true,
            },
          );

        if (result?.result === 'ok') {
          deletedCount += 1;

          console.log(
            `[DELETED] [${asset.resource_type}] ${asset.public_id}`,
          );
        } else if (
          result?.result === 'not found'
        ) {
          notFoundCount += 1;

          console.log(
            `[NOT FOUND] [${asset.resource_type}] ${asset.public_id}`,
          );
        } else {
          failedCount += 1;

          console.error(
            `[FAILED] [${asset.resource_type}] ${asset.public_id}`,
          );

          console.error(
            result,
          );
        }
      } catch (error) {
        failedCount += 1;

        console.error(
          `[ERROR] [${asset.resource_type}] ${asset.public_id}`,
        );

        console.error(error);
      }
    }

    // =====================================================
    // 8. CLEANUP SUMMARY
    // =====================================================

    console.log('');
    console.log(
      '========================================',
    );
    console.log(
      '       CLEANUP RESULT',
    );
    console.log(
      '========================================',
    );
    console.log('');

    console.log(
      `Deleted: ${deletedCount}`,
    );

    console.log(
      `Already missing: ${notFoundCount}`,
    );

    console.log(
      `Failed: ${failedCount}`,
    );

    console.log('');

    if (failedCount === 0) {
      console.log(
        'Cleanup completed successfully.',
      );
    } else {
      console.log(
        'Cleanup completed with errors.',
      );

      console.log(
        'Run the audit again before doing anything else.',
      );
    }

    console.log('');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('');
  console.error(
    'Orphan media cleanup failed:',
    error,
  );

  process.exitCode = 1;
});