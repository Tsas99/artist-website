import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';

export type UploadedMediaFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type UploadedMediaResult = {
  url: string;
  publicId: string;
  type: 'image' | 'video';
};

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,
      api_key:
        process.env.CLOUDINARY_API_KEY,
      api_secret:
        process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadMedia(
    file: UploadedMediaFile,
  ): Promise<UploadedMediaResult> {
    const allowedImages = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    const allowedVideos = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    const isImage = allowedImages.includes(
      file.mimetype,
    );

    const isVideo = allowedVideos.includes(
      file.mimetype,
    );

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Only JPG, PNG, WebP, MP4, WebM and MOV files are allowed.',
      );
    }

    /*
     * Original files may be larger than
     * Cloudinary's current image upload limit
     * because images are optimized before upload.
     */
    const IMAGE_ORIGINAL_MAX_SIZE =
      30 * 1024 * 1024;

    const VIDEO_MAX_SIZE =
      100 * 1024 * 1024;

    if (
      isImage &&
      file.size > IMAGE_ORIGINAL_MAX_SIZE
    ) {
      throw new BadRequestException(
        'Original image must be smaller than 30 MB.',
      );
    }

    if (
      isVideo &&
      file.size > VIDEO_MAX_SIZE
    ) {
      throw new BadRequestException(
        'Video must be smaller than 100 MB.',
      );
    }

    const type: 'image' | 'video' =
      isVideo ? 'video' : 'image';

    let uploadBuffer = file.buffer;

    /*
     * Optimize artwork images for the web.
     *
     * - Respect EXIF orientation
     * - Preserve aspect ratio
     * - No cropping
     * - Maximum long edge: 3200 px
     * - Never enlarge smaller images
     * - Convert to WebP
     */
    if (isImage) {
      try {
        uploadBuffer = await sharp(
          file.buffer,
        )
          .rotate()
          .resize({
            width: 3200,
            height: 3200,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({
            quality: 88,
          })
          .toBuffer();
      } catch (error) {
        console.error(
          'Image optimization error:',
          error,
        );

        throw new BadRequestException(
          'Image could not be processed.',
        );
      }
    }

    /*
     * Safety check after optimization.
     *
     * The current Cloudinary upload request
     * accepts images below 10 MB.
     */
    const CLOUDINARY_IMAGE_MAX_SIZE =
      10 * 1024 * 1024;

    if (
      isImage &&
      uploadBuffer.length >
        CLOUDINARY_IMAGE_MAX_SIZE
    ) {
      throw new BadRequestException(
        'The optimized image is still larger than 10 MB.',
      );
    }

    try {
      return await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: 'artist-website',
                resource_type: type,
              },
              (error, result) => {
                if (error) {
                  return reject(error);
                }

                if (!result) {
                  return reject(
                    new Error(
                      'Cloudinary upload failed',
                    ),
                  );
                }

                resolve({
                  url: result.secure_url,
                  publicId:
                    result.public_id,
                  type,
                });
              },
            );

          Readable.from(
            uploadBuffer,
          ).pipe(uploadStream);
        },
      );
    } catch (error) {
      console.error(
        'Cloudinary upload error:',
        error,
      );

      throw new InternalServerErrorException(
        'Media upload failed.',
      );
    }
  }

  async deleteMedia(
    publicId: string,
    type: 'image' | 'video',
  ) {
    try {
      return await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: type,
        },
      );
    } catch (error) {
      console.error(
        'Cloudinary delete error:',
        error,
      );

      throw new InternalServerErrorException(
        'Media deletion failed.',
      );
    }
  }
}