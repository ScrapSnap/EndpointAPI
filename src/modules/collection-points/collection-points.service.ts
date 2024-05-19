import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CollectionPoint } from './schemas/collection-point.schema';
import { Model } from 'mongoose';

@Injectable()
export class CollectionPointsService {

  constructor(
    @InjectModel(CollectionPoint.name) private readonly collectionPointModel: Model<CollectionPoint>
  ){}

  async create(createCollectionPointDto: CreateCollectionPointDto) {
    const createdCollectionPoint = new this.collectionPointModel(createCollectionPointDto);
    return createdCollectionPoint.save();
  }

  async findAll(): Promise<CollectionPoint[]> {
    return this.collectionPointModel.find().exec();
  }

  async findOne(id: string): Promise<CollectionPoint> {
    const collectionPoint = await this.collectionPointModel.findById(id).exec();
    if (!collectionPoint) {
        throw new NotFoundException(`CollectionPoint with ID ${id} not found`);
    }
    return collectionPoint;
  }

  async replace(id: string, createCollectionPointDto: CreateCollectionPointDto): Promise<CollectionPoint> {
    const replacedCollectionPoint = await this.collectionPointModel.findByIdAndUpdate(id, createCollectionPointDto, { new: true, overwrite: true }).exec();
    if (!replacedCollectionPoint) {
      throw new NotFoundException(`CollectionPoint with ID ${id} not found`);
    }
    return replacedCollectionPoint;
  }

  async update(id: string, updateCollectionPointDto: UpdateCollectionPointDto): Promise<CollectionPoint> {
      const updatedCollectionPoint = await this.collectionPointModel.findByIdAndUpdate(id, updateCollectionPointDto, { new: true }).exec();
      if (!updatedCollectionPoint) {
          throw new NotFoundException(`CollectionPoint with ID ${id} not found`);
      }
      return updatedCollectionPoint;
  }

  async remove(id: string): Promise<CollectionPoint> {
    const deletedCollectionPoint = await this.collectionPointModel.findByIdAndDelete(id).exec();
    if (!deletedCollectionPoint) {
        throw new NotFoundException(`CollectionPoint with ID ${id} not found`);
    }
    return deletedCollectionPoint;
  }
}
