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
    // 1. READ ALL MEDIA REFERENCES FROM DATABASE
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
          id: true,
          coverPublicId:true,
        },
      }),
      prisma.exhibitionMedia.findMany({
        select:{
          id: true,
          exhibitionId: true,
          publicId: true,
        }
      })
    ]);

    // =====================================================
    // 2. COLLECT ALL PUBLIC IDs USED BY DATABASE
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
    })

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

    // =====================================================
    // 5. CREATE CLOUDINARY PUBLIC ID SET
    // =====================================================

    const cloudinaryPublicIds = new Set(
      cloudinaryAssets.map(
        (asset) => asset.public_id,
      ),
    );

    // =====================================================
    // 6. FIND CLOUDINARY ORPHANS
    //
    // Cloudinary asset exists
    // but database does not reference it.
    //
    // Legacy imageUrls are protected.
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

    // =====================================================
    // 7. FIND BROKEN DATABASE REFERENCES
    //
    // Database references a publicId
    // but Cloudinary no longer contains it.
    // =====================================================

    const missingFromCloudinary = [
      ...usedPublicIds,
    ].filter(
      (publicId) =>
        !cloudinaryPublicIds.has(publicId),
    );

    // =====================================================
// 7.1 FIND WHERE BROKEN REFERENCES ARE USED
// =====================================================

const brokenReferenceDetails: Array<{
  publicId: string;
  source: string;
  recordId: number;
  relatedId?: number;
}> = [];

for (const publicId of missingFromCloudinary) {
  works.forEach((item, index) => {
    if (item.imagePublicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'Work.imagePublicId',
        recordId: index + 1,
      });
    }
  });

  workMedia.forEach((item, index) => {
    if (item.publicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'WorkMedia.publicId',
        recordId: index + 1,
      });
    }
  });

  about.forEach((item, index) => {
    if (item.profileImagePublicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'About.profileImagePublicId',
        recordId: index + 1,
      });
    }
  });

  press.forEach((item, index) => {
    if (item.coverPublicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'Press.coverPublicId',
        recordId: index + 1,
      });
    }
  });

  pressMedia.forEach((item, index) => {
    if (item.publicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'PressMedia.publicId',
        recordId: index + 1,
      });
    }
  });

  homeMedia.forEach((item, index) => {
    if (item.publicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'HomeMedia.publicId',
        recordId: index + 1,
      });
    }
  });

  news.forEach((item, index) => {
    if (item.posterPublicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source: 'News.posterPublicId',
        recordId: index + 1,
      });
    }
  });

  exhibitions.forEach((item) =>{
    if (item.coverPublicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source:'Exhibition.coverPublicId',
        recordId: item.id,
      });
    }
  });

  exhibitionMedia.forEach((item) => {
    if (item.publicId === publicId) {
      brokenReferenceDetails.push({
        publicId,
        source:'ExhibitionMedia.publicId',
        recordId: item.id,
        relatedId: item.exhibitionId,
      });
    }
  });

}


    // =====================================================
    // 8. REPORT
    //
    // IMPORTANT:
    // THIS SCRIPT DOES NOT DELETE ANYTHING.
    // =====================================================

    console.log('');
    console.log(
      '========================================',
    );
    console.log(
      '       ORPHAN MEDIA AUDIT',
    );
    console.log(
      '========================================',
    );
    console.log('');

    console.log(
      `Cloudinary assets: ${cloudinaryAssets.length}`,
    );

    console.log(
      `Cloudinary images: ${images.length}`,
    );

    console.log(
      `Cloudinary videos: ${videos.length}`,
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

    console.log(
      `DB references missing from Cloudinary: ${missingFromCloudinary.length}`,
    );

    // =====================================================
    // 9. PRINT ORPHAN CANDIDATES
    // =====================================================

    if (orphanCandidates.length > 0) {
      console.log('');
      console.log(
        '----------------------------------------',
      );
      console.log(
        'ORPHAN CANDIDATES',
      );
      console.log(
        '----------------------------------------',
      );
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
    } else {
      console.log('');
      console.log(
        'No orphan candidates found.',
      );
    }

    // =====================================================
    // =====================================================
// 10. PRINT DB REFERENCES MISSING FROM CLOUDINARY
// =====================================================

if (brokenReferenceDetails.length > 0) {
  console.log('');
  console.log(
    '----------------------------------------',
  );
  console.log(
    'DB REFERENCES MISSING FROM CLOUDINARY',
  );
  console.log(
    '----------------------------------------',
  );
  console.log('');

  brokenReferenceDetails.forEach(
    (item, index) => {
      console.log(`${index + 1}. ${item.publicId}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Record ID: ${item.recordId}`);

     if (item.relatedId !== undefined) {
  if (item.source === 'WorkMedia.publicId') {
    console.log(`   Work ID: ${item.relatedId}`);
  } else if (item.source === 'PressMedia.publicId') {
    console.log(`   Press ID: ${item.relatedId}`);
  } else if (item.source === 'ExhibitionMedia.publicId') {
    console.log(`   Exhibition ID: ${item.relatedId}`);
  }
}

      console.log('');
    },
  );
} else {
  console.log('');
  console.log(
    'All DB publicIds exist in Cloudinary.',
  );
}

    // =====================================================
    // 11. FINAL SAFETY MESSAGE
    // =====================================================

    console.log('');
    console.log(
      '========================================',
    );
    console.log(
      'AUDIT ONLY — NOTHING WAS DELETED.',
    );
    console.log(
      '========================================',
    );
    console.log('');
  } finally {
    await app.close();
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