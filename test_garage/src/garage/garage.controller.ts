import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GarageService } from './garage.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Controller('garage')
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('Uploaded file:', file);
    await this.garageService.upload(file, file.filename);
    return { path: file.filename };
  }
}
