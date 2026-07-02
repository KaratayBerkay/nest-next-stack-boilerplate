import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageVariants {
  badge: string;
  medium: string;
  full: string;
}

export const IMAGE_SIZES = {
  badge: { width: 64, height: 64 },
  medium: { width: 400, height: 400 },
  full: { width: 1920, height: 1080 },
} as const;

@Injectable()
export class ImageService {
  async resize(
    buffer: Buffer,
    size: keyof typeof IMAGE_SIZES,
  ): Promise<Buffer> {
    const { width, height } = IMAGE_SIZES[size];
    return sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }
}
