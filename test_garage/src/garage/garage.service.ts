// src/garage/garage.service.ts
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as fs from 'fs'

@Injectable()
export class GarageService {
  private s3: S3Client;
  private bucket: string;

  

  constructor(private config: ConfigService) {
    const endpoint = this.config.get('GARAGE_ENDPOINT');
    const region = this.config.get('GARAGE_REGION');
    const accessKey = this.config.get('GARAGE_ACCESS_KEY');
    const secretKey = this.config.get('GARAGE_SECRET_KEY');
    this.bucket = this.config.get('GARAGE_BUCKET')!;
  
    if (!endpoint || !region || !accessKey || !secretKey || !this.bucket) {
      throw new Error('Garage S3 config is missing');
    }

    
  
    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }
  
    

  async upload(file: Express.Multer.File, key: string) {
    const fileStream = fs.createReadStream(file.path);
  
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: fileStream,
        ContentType: file.mimetype,
      },
    });
  
    await upload.done();
    return key;
  }
  

  async delete(path: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }),
    );
  }

  async getStream(path: string) {
    const obj = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }),
    );
    return obj.Body as Readable;
  }
}
