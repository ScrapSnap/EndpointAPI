import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

import { ImageSnap } from './schemas/image-snap.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ImageSnapsService {
  private minioClient: Minio.Client;
  private readonly logger = new Logger(ImageSnapsService.name);

  constructor(private configService: ConfigService,
    @InjectModel(ImageSnap.name) private imageSnapModel: Model<ImageSnap>
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });

  }

  private async createBucketIfNotExists(bucketName: string) {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }

  async uploadFile(userId: string, longitude: number, latitude: number, bucketName: string, file: Express.Multer.File) {
    try {
      await this.createBucketIfNotExists(bucketName);
      const fileName = `${Date.now()}-${file.originalname}`;
      const eTag = await this.minioClient.putObject(bucketName, fileName, file.buffer, file.size);

      const imageSnap = new this.imageSnapModel({
        userId: userId,
        fileName: fileName,
        bucketName: bucketName,
        fileEtag: eTag.etag,
        longitude: longitude,
        latitude: latitude
      });

      try {
        await imageSnap.save();
      } catch (error) {
        await this.minioClient.removeObject(bucketName, fileName);
        throw new HttpException('Failed to save image snap', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {fileName: fileName, eTag: eTag.etag};
    } catch (error) {
      throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileUrl(bucketName: string, fileName: string) {
    try {
      return await this.minioClient.presignedUrl('GET', bucketName, fileName);
    } catch (error) {
      throw new HttpException('Failed to get file URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getBucketNames() {
    try {
      const buckets = await this.minioClient.listBuckets();
      return buckets.map(bucket => bucket.name);
    } catch (error) {
      throw new HttpException('Failed to get bucket names', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllFileNames(bucketName: string): Promise<{ status: number, fileNames?: string[], error?: string }> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      return { status: 404, error: 'Bucket not found' };
    }

    try {
      const stream = this.minioClient.listObjectsV2(bucketName, '', true);
      const fileNames: string[] = [];

      for await (const obj of stream) {
        fileNames.push(obj.name);
      }
      return { status: 200, fileNames };
    } catch (error) {
      return { status: 500, error: 'Failed to get file names' };
    }
  }

  async getFileNamesByUserId(userId: string): Promise<{ fileName: string, bucketName: string }[]> {
    try {
      const imageSnaps = await this.imageSnapModel.find({ userId: userId });
      
      return imageSnaps.map(imageSnap => ({
        fileName: imageSnap.fileName,
        bucketName: imageSnap.bucketName,
        
      }));
    } catch (error) {
      throw new HttpException('Failed to get file names', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(bucketName: string, fileName: string) {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      await this.imageSnapModel.deleteOne({fileName: fileName});
    } catch (error) {
      throw new HttpException('Failed to delete file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
