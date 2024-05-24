import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UsePipes, ValidationPipe, Put, UseGuards } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CollectionPoint } from './schemas/collection-point.schema';
import { AuthGuard } from '../auth/auth.guard';
import { Permission } from "../permissions/enums/permissions.enum";
import { Permissions } from '../permissions/enums/permissions.decorator';

@ApiTags('Collection-points')
@UseGuards(AuthGuard)
@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly collectionPointsService: CollectionPointsService) {}

  @Post()
  @Permissions(Permission.WRITE_COLLECTION_POINTS)
  @ApiOperation({ summary: 'Create a new collection point' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The collection point has been successfully created.', type: CollectionPoint })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCollectionPointDto: CreateCollectionPointDto) {
    return this.collectionPointsService.create(createCollectionPointDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all collection points' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all collection points.', type: [CollectionPoint] })
  findAll() {
    return this.collectionPointsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collection point by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The collection point with the specified ID.', type: CollectionPoint })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Collection point not found.' })
  findOne(@Param('id') id: string) {
    return this.collectionPointsService.findOne(id);
  }

  @Put(':id')
  @Permissions(Permission.WRITE_COLLECTION_POINTS)
  @ApiOperation({ summary: 'Replace a collection point by ID (Idempotent)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The collection point has been successfully replaced.', type: CollectionPoint })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Collection point not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  replace(@Param('id') id: string, @Body() createCollectionPointDto: CreateCollectionPointDto) {
    return this.collectionPointsService.replace(id, createCollectionPointDto);
  }

  @Patch(':id')
  @Permissions(Permission.WRITE_COLLECTION_POINTS)
  @ApiOperation({ summary: 'Update a collection point by ID (Not idempotent use carefuly)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The collection point has been successfully updated.', type: CollectionPoint })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Collection point not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateCollectionPointDto: UpdateCollectionPointDto) {
    return this.collectionPointsService.update(id, updateCollectionPointDto);
  }

  @Delete(':id')
  @Permissions(Permission.DELETE_COLLECTION_POINTS)
  @ApiOperation({ summary: 'Delete a collection point by ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The collection point has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Collection point not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.collectionPointsService.remove(id);
  }
}
