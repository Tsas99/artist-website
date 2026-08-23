import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export type UploadedImageFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
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

  async uploadImage(file: UploadedImageFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'artist-website',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error('Cloudinary upload failed'));
          }

          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}