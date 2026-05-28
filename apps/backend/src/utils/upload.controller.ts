import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import multer from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is missing');
    }

    const result = await this.cloudinary.uploadBuffer(
      file.buffer,
      {
        folder: `${folder}`,
      },
      (progress) => {
        console.log(
          `Upload progress: ${progress.percentage}% (${progress.uploadedBytes}/${progress.totalBytes})`,
        );
      },
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
}
