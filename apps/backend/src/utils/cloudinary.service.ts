import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiOptions, ResourceType } from 'cloudinary';
import { UploadProgressCallback } from 'src/types';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadBuffer(
    buffer: Buffer,
    options: UploadApiOptions & { folder?: string },
    onProgress?: UploadProgressCallback,
  ): Promise<UploadApiResponse> {
    const totalBytes = buffer.length;
    let uploadedBytes = 0;

    const readable = new Readable({
      read(chunkSize) {
        const chunk = buffer.subarray(uploadedBytes, uploadedBytes + chunkSize);
        uploadedBytes += chunk.length;

        if (onProgress) {
          onProgress({
            uploadedBytes,
            totalBytes,
            percentage: Math.round((uploadedBytes / totalBytes) * 100),
          });
        }

        this.push(chunk.length ? chunk : null);
      },
    });

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          timestamp: Math.round(Date.now() / 1000),
          ...options,
        },
        (error, result) => {
          if (error) return reject(error as Error);
          resolve(result);
        },
      );

      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete multiple resources by public ID.
   * Extracts the public_id from a Cloudinary URL when a full URL is passed.
   */
  async deleteResources(
    publicIdsOrUrls: string[],
    resourceType: ResourceType = 'video',
  ): Promise<void> {
    const publicIds = publicIdsOrUrls
      .map((idOrUrl) =>
        idOrUrl.startsWith('http') ? this.extractPublicId(idOrUrl) : idOrUrl,
      )
      .filter(Boolean);

    if (!publicIds.length) return;

    await this.cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  }

  private extractPublicId(url: string): string | null {
    // URL format: https://res.cloudinary.com/{cloud}/video/upload/v{ver}/{folder}/{id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match?.[1] ?? null;
  }
}
