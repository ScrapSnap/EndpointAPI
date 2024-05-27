import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CollectionPoint } from './schemas/collection-point.schema';
import { Model } from 'mongoose';
import { GarbageType } from "../utils/schemas/garbage-type.enum";

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

  async initDefaultCollectionPoints(): Promise<boolean> {
    const count = await this.collectionPointModel.countDocuments().exec();
    if (count > 0) {
      return true;
    }

    let collectionPoint = new CollectionPoint();
    collectionPoint.acceptsGargabeTypes = [GarbageType.PAPER, GarbageType.PLASTIC, GarbageType.GLASS, GarbageType.ORGANIC];
    collectionPoint.location = 'Murska Sobota';
    collectionPoint.latitude = 46.661362;
    collectionPoint.longitude = 16.166201;
    await this.collectionPointModel.create(collectionPoint);

    collectionPoint = new CollectionPoint();
    collectionPoint.acceptsGargabeTypes = [GarbageType.PAPER, GarbageType.PLASTIC, GarbageType.GLASS, GarbageType.METAL, GarbageType.ORGANIC];
    collectionPoint.location = 'Maribor';
    collectionPoint.latitude = 46.554649;
    collectionPoint.longitude = 15.645881;
    await this.collectionPointModel.create(collectionPoint);

    collectionPoint = new CollectionPoint();
    collectionPoint.acceptsGargabeTypes = [GarbageType.PAPER, GarbageType.PLASTIC, GarbageType.GLASS, GarbageType.METAL, GarbageType.ORGANIC];
    collectionPoint.location = 'Ljubljana';
    collectionPoint.latitude = 46.056946;
    collectionPoint.longitude = 14.505751;
    await this.collectionPointModel.create(collectionPoint);

    collectionPoint = new CollectionPoint();
    collectionPoint.acceptsGargabeTypes = [GarbageType.PAPER, GarbageType.PLASTIC, GarbageType.GLASS, GarbageType.METAL, GarbageType.ORGANIC];
    collectionPoint.location = 'Koper';
    collectionPoint.latitude = 45.548058;
    collectionPoint.longitude = 13.730187;
    await this.collectionPointModel.create(collectionPoint);

    collectionPoint = new CollectionPoint();
    collectionPoint.acceptsGargabeTypes = [GarbageType.PAPER, GarbageType.PLASTIC, GarbageType.GLASS, GarbageType.METAL, GarbageType.ORGANIC];
    collectionPoint.location = 'Nova Gorica';
    collectionPoint.latitude = 45.961416;
    collectionPoint.longitude = 13.643745;
    await this.collectionPointModel.create(collectionPoint);

    return true;
  }
}
