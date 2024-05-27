import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

import { ImageSnap } from './schemas/image-snap.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Time in ms to wait before retrying
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status >= 500;
  },
});
@Injectable()
export class ImageSnapsService {
  private minioClient: Minio.Client;
  private readonly geoApiKey: string;
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

    this.geoApiKey = this.configService.get('GEOCODE_API_KEY');
  }

  private async createBucketIfNotExists(bucketName: string) {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }

  async getAddressFromCoordinates(longitude: number, latitude: number)  {
    this.logger.log(`API Key: ${this.geoApiKey}`);
    const fetchUrl = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${this.geoApiKey}`;
    this.logger.log(`Fetching: ${fetchUrl}`);
    
    try {
      const response = await axios.get(fetchUrl);
      this.logger.log(`Response: ${JSON.stringify(response.data)}`);
      return response.data.display_name;
    } catch (error) {
      this.logger.error(`Error fetching data: ${error}`);
      throw new HttpException('Failed to fetch address from coordinates', HttpStatus.INTERNAL_SERVER_ERROR);
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
        this.logger.error(`Failed to save image snap: ${error}`);
        throw new HttpException(`Failed to save image snap: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {fileName: fileName, eTag: eTag.etag};
    } catch (error) {
      this.logger.error(`File upload failed: ${error}`);
      throw new HttpException(`File upload failed: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getImage(bucketName: string, fileName: string) {
    this.logger.log(`Getting object: ${bucketName}/${fileName}`);
    try {
      return await this.minioClient.getObject(bucketName, fileName);
    } catch (error) {
      this.logger.error(`Failed to get object: ${error}`);
      throw new HttpException(`Failed to get object: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getBucketNames() {
    try {
      const buckets = await this.minioClient.listBuckets();
      return buckets.map(bucket => bucket.name);
    } catch (error) {
      this.logger.error(`Failed to get bucket names: ${error}`);
      throw new HttpException(`Failed to get bucket names: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllFileNames(bucketName: string): Promise<{ status: number, fileNames?: string[], error?: string }> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      return { status: 404, error: `Bucket not found` };
    }

    try {
      const stream = this.minioClient.listObjectsV2(bucketName, '', true);
      const fileNames: string[] = [];

      for await (const obj of stream) {
        fileNames.push(obj.name);
      }
      return { status: 200, fileNames };
    } catch (error) {
      this.logger.error(`Failed to get file names: ${error}`);
      return { status: 500, error: `Failed to get file names: '${error}'` };
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
      this.logger.error(`Failed to get file names: ${error}`);
      throw new HttpException(`Failed to get file names: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileInfoOfFilesInBucket(bucketName: string): Promise<{ fileName: string, userId: string, longitude: number, latitude: number, created: Date }[]> {
    try {
      const imageSnaps = await this.imageSnapModel.find({ bucketName: bucketName });
      return imageSnaps.map(imageSnap => ({
        fileName: imageSnap.fileName,
        userId: imageSnap.userId,
        longitude: imageSnap.longitude,
        latitude: imageSnap.latitude,
        created: imageSnap.createdAt
      }));
    } catch (error) {
      this.logger.error(`Failed to get file names: ${error}`);
      throw new HttpException(`Failed to get file names: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(bucketName: string, fileName: string) {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      await this.imageSnapModel.deleteOne({fileName: fileName});
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`);
      throw new HttpException(`Failed to delete file: '${error}'`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
