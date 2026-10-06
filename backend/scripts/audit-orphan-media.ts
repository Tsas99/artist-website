import 'dotenv/config';

import { v2 as cloudinary } from 'cloudinary';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    // -----------------------------------------
    // 1. Collect every Cloudinary publicId
    // currently referenced by PostgreSQL.
    // -----------------------------------------

    const [
      works,
      workMedia,
      aboutRecords,
      presses,
      pressMedia,
      homeMedia,
      news,
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
    ]);

    const usedPublicIds = new Set<string>();

    function addPublicId(
      value: string | null | undefined,
    ) {
      if (value) {
        usedPublicIds.add(value);
      }
    }

    works.forEach((work) => {
      addPublicId(work.imagePublicId);
    });

    workMedia.forEach((item) => {
      addPublicId(item.publicId);
    });

    aboutRecords.forEach((item) => {
      addPublicId(item.profileImagePublicId);
    });

    presses.forEach((item) => {
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

    // -----------------------------------------
    // 2. Legacy Work.imageUrls protection.
    //
    // These contain URLs rather than publicIds.
    // We keep them separately so we do NOT
    // accidentally classify those assets as
    // safe-to-delete orphans.
    // -----------------------------------------

    const legacyImageUrls = new Set<string>();

    works.forEach((work) => {
      work.imageUrls.forEach((url) => {
        if (url) {
          legacyImageUrls.add(url);
        }
      });
    });

    // -----------------------------------------
    // 3. Read all Cloudinary resources inside
    // artist-website.
    // Images and videos are queried separately.
    // -----------------------------------------

    async function getResources(
      resourceType: 'image' | 'video',
    ) {
      const resources: Array<{
        public_id: string;
        secure_url: string;
        resource_type: string;
      }> = [];

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

        resources.push(...result.resources);

        nextCursor = result.next_cursor;
      } while (nextCursor);

      return resources;
    }

    const [images, videos] = await Promise.all([
      getResources('image'),
      getResources('video'),
    ]);

    const cloudinaryAssets = [
      ...images,
      ...videos,
    ];

    // -----------------------------------------
    // 4. Find orphan candidates.
    // -----------------------------------------

    const orphanCandidates =
      cloudinaryAssets.filter((asset) => {
        if (
          usedPublicIds.has(asset.public_id)
        ) {
          return false;
        }

        // Protect old assets referenced only by
        // Work.imageUrls.
        if (
          legacyImageUrls.has(asset.secure_url)
        ) {
          return false;
        }

        return true;
      });

    // -----------------------------------------
    // 5. READ-ONLY REPORT.
    // Nothing is deleted.
    // -----------------------------------------

    console.log('');
    console.log('=== ORPHAN MEDIA AUDIT ===');
    console.log('');

    console.log(
      `Cloudinary assets: ${cloudinaryAssets.length}`,
    );

    console.log(
      `Unique DB publicIds: ${usedPublicIds.size}`,
    );

    console.log(
      `Protected legacy imageUrls: ${legacyImageUrls.size}`,
    );

    console.log(
      `Orphan candidates: ${orphanCandidates.length}`,
    );

    console.log('');

    if (orphanCandidates.length === 0) {
      console.log(
        'No orphan candidates found.',
      );
    } else {
      console.log('ORPHAN CANDIDATES:');
      console.log('');

      orphanCandidates.forEach(
        (asset, index) => {
          console.log(
            `${index + 1}. [${asset.resource_type}] ${asset.public_id}`,
          );

          console.log(
            `   ${asset.secure_url}`,
          );
        },
      );
    }

    console.log('');
    console.log(
      'AUDIT ONLY — nothing was deleted.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('');
  console.error(
    'Orphan media audit failed:',
    error,
  );

  process.exitCode = 1;
});