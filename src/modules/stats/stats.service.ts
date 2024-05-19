import { Injectable } from '@nestjs/common';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { Stat } from './schemas/stat.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StatsService {
  constructor(@InjectModel(Stat.name) private statModel: Model<Stat>) {}

  async create(createStatDto: CreateStatDto): Promise<Stat> {
    const createdStat = new this.statModel(createStatDto);
    return createdStat.save();
  }

  async findAll(): Promise<Stat[]> {
    return this.statModel.find().exec();
  }

  async findOne(id: string): Promise<Stat> {
    return this.statModel.findById(id).exec();
  }

  async update(id: string, updateStatDto: UpdateStatDto): Promise<Stat | null> {
    return this.statModel.findByIdAndUpdate(id, updateStatDto, { new: true }).exec();
  }

  async delete(id: string): Promise<Stat | null> {
    return this.statModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<any> {
    return this.statModel.deleteMany().exec();
  }

  async findStatByUserId(userId: string): Promise<Stat[]> {
    return this.statModel.find({ userId }).exec();
  }

  async findStatByDate(date: Date): Promise<Stat[]> {
    return this.statModel.find({ date }).exec();
  }

  async findStatByGarbageCollected(garbageCollected: string): Promise<Stat[]> {
    return this.statModel.find({ garbageCollected }).exec();
  }

  async findWithGarbageType(garbageType: string): Promise<Stat[]> {
    const query = {};
    query[`garbageCollected.${garbageType}`] = { $gt: 0 };
    return this.statModel.find(query).exec();
  }
}
