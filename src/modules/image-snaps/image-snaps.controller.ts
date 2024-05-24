import { Controller, Get, Post, Param, Delete, UploadedFile, UseInterceptors, HttpStatus, Res, Body, UseGuards } from '@nestjs/common';
import { ImageSnapsService } from './image-snaps.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { imageFileFilter } from '../utils/file-upload.utils';
import { Response } from 'express';
import { CreateImageSnapDto } from './dto/create-image-snap.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Image snaps')
@ApiBearerAuth()
@Controller('image-snaps')
export class ImageSnapsController {
  constructor(private readonly imageSnapsService: ImageSnapsService) {}

  @UseGuards(AuthGuard)
  @Get('files/:bucketName')
  @ApiOperation({ summary: 'Get all filenames from a specific bucket' })
  @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
  @ApiResponse({ status: 200, description: 'Filenames retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bucket not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllFileNames(@Param('bucketName') bucketName: string, @Res() res: Response) {
    const result = await this.imageSnapsService.getAllFileNames(bucketName);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(result.status).json(result.fileNames);
  }

  @UseGuards(AuthGuard)
  @Get('file/:bucketName/:fileName')
  @ApiOperation({ summary: 'Get a file URL from a specific bucket' })
  @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
  @ApiParam({ name: 'fileName', required: true, description: 'Name of the file' })
  @ApiResponse({ status: 200, description: 'File URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFileUrl(@Param('bucketName') bucketName: string, @Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const url = await this.imageSnapsService.getFileUrl(bucketName, fileName);
      return res.status(HttpStatus.OK).json({ url });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get file URL' });
    }
  }

  @UseGuards(AuthGuard)
  @Get('files/user/:userId')
  @ApiOperation({ summary: 'Get filenames and bucket names by user ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'Filenames and bucket names retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFileNamesByUserId(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const files = await this.imageSnapsService.getFileNamesByUserId(userId);
      return res.status(HttpStatus.OK).json({ files });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get file names' });
    }
  }

  @UseGuards(AuthGuard)
  @Get('buckets')
  @ApiOperation({ summary: 'Get all bucket names' })
  @ApiResponse({ status: 200, description: 'Bucket names retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBucketNames(@Res() res: Response) {
    try {
      const bucketNames = await this.imageSnapsService.getBucketNames();
      return res.status(HttpStatus.OK).json({ bucketNames });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get bucket names' });
    }
  }

  @UseGuards(AuthGuard)
  @Post('upload/:bucketName')
  @UseInterceptors(FileInterceptor('file', { fileFilter: imageFileFilter }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
        longitude: {
          type: 'number',
        },
        latitude: {
          type: 'number',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file to a specific bucket' })
  @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async uploadFile(@Param('bucketName') bucketName: string, @UploadedFile() file: Express.Multer.File, @Body() imageSnapDto: CreateImageSnapDto, @Res() res: Response) {
    try {
      const fileName = await this.imageSnapsService.uploadFile(imageSnapDto.userId, imageSnapDto.longitude, imageSnapDto.latitude, bucketName, file);
      return res.status(HttpStatus.CREATED).json({ fileName });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'File upload failed' });
    }
  }

  @UseGuards(AuthGuard)
  @Delete('file/:bucketName/:fileName')
  @ApiOperation({ summary: 'Delete a file from a specific bucket' })
  @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
  @ApiParam({ name: 'fileName', required: true, description: 'Name of the file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteFile(@Param('bucketName') bucketName: string, @Param('fileName') fileName: string, @Res() res: Response) {
    try {
      await this.imageSnapsService.deleteFile(bucketName, fileName);
      return res.status(HttpStatus.OK).json({ message: 'File deleted successfully' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete file' });
    }
  }
}