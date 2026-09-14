import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

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
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const IMAGE_MAX_SIZE =
      15 * 1024 * 1024;

    const VIDEO_MAX_SIZE =
      100 * 1024 * 1024;

    if (
      isImage &&
      file.size > IMAGE_MAX_SIZE
    ) {
      throw new BadRequestException(
        'Image must be smaller than 15 MB.',
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
            file.buffer,
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