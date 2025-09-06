// src/videos/videos.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Param, Res, Delete, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GarageService } from '../garage/garage.service';
import express from 'express';
import { v4 as uuid } from 'uuid';

@Controller('videos')
export class VideosController {
  constructor(private garage: GarageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const fileName = `${uuid()}_${file.originalname}`;
    await this.garage.upload(file, fileName);
    return { path: fileName };
  }

  @Get(':filename')
  async stream(@Param('filename') filename: string, @Res() res: express.Response) {
    const stream = await this.garage.getStream(filename);
    res.setHeader('Content-Type', 'video/mp4'); // adjust if needed
    stream.pipe(res);
  }

  @Delete(':filename')
  async delete(@Param('filename') filename: string) {
    await this.garage.delete(filename);
    return { deleted: filename };
  }
}
