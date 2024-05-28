import { Injectable } from '@nestjs/common';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { Stat } from './schemas/stat.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GarbageCollected } from './schemas/garbageCollected.schema';

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
    return this.statModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: '$userId',
          totalPaper: { $sum: '$garbageCollected.paper' },
          totalPlastic: { $sum: '$garbageCollected.plastic' },
          totalGlass: { $sum: '$garbageCollected.glass' },
          totalMetal: { $sum: '$garbageCollected.metal' },
          totalOrganic: { $sum: '$garbageCollected.organic' },

          total: {
            $sum: {
              $add: [
                '$garbageCollected.paper',
                '$garbageCollected.plastic',
                '$garbageCollected.glass',
                '$garbageCollected.metal',
                '$garbageCollected.organic',
              ],
            },
          },

          count: { $sum: 1 },

          avgPaper: { $avg: '$garbageCollected.paper' },
          avgPlastic: { $avg: '$garbageCollected.plastic' },
          avgGlass: { $avg: '$garbageCollected.glass' },
          avgMetal: { $avg: '$garbageCollected.metal' },
          avgOrganic: { $avg: '$garbageCollected.organic' },

          avg: {
            $avg: {
              $add: [
                '$garbageCollected.paper',
                '$garbageCollected.plastic',
                '$garbageCollected.glass',
                '$garbageCollected.metal',
                '$garbageCollected.organic',
              ],
            },
          },
          
          minPaper: { $min: '$garbageCollected.paper' },
          minPlastic: { $min: '$garbageCollected.plastic' },
          minGlass: { $min: '$garbageCollected.glass' },
          minMetal: { $min: '$garbageCollected.metal' },
          minOrganic: { $min: '$garbageCollected.organic' },

          min: {
            $min: {
              $add: [
                '$garbageCollected.paper',
                '$garbageCollected.plastic',
                '$garbageCollected.glass',
                '$garbageCollected.metal',
                '$garbageCollected.organic',
              ],
            },
          },

          maxPaper: { $max: '$garbageCollected.paper' },
          maxPlastic: { $max: '$garbageCollected.plastic' },
          maxGlass: { $max: '$garbageCollected.glass' },
          maxMetal: { $max: '$garbageCollected.metal' },
          maxOrganic: { $max: '$garbageCollected.organic' },

          max: {
            $max: {
              $add: [
                '$garbageCollected.paper',
                '$garbageCollected.plastic',
                '$garbageCollected.glass',
                '$garbageCollected.metal',
                '$garbageCollected.organic',
              ],
            },
          },

          garbageCollected: { $push: '$garbageCollected' },
        },
      },
    ]);
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

  async initDefaultStats(userId: string): Promise<void> {

    // Check if stats already exist
    const stats = await this.findStatByUserId(userId);
    if (stats.length > 0) {
      return;
    }

    // Create 10 random stats for the user
    for (let i = 0; i < 10; i++) {
      
      let statsDto = new CreateStatDto();
      statsDto.userId = userId;

      statsDto.garbageCollected = new GarbageCollected();

      statsDto.garbageCollected.paper = Math.floor(Math.random() * 100);
      statsDto.garbageCollected.plastic = Math.floor(Math.random() * 100);
      statsDto.garbageCollected.glass = Math.floor(Math.random() * 100);
      statsDto.garbageCollected.metal = Math.floor(Math.random() * 100);
      statsDto.garbageCollected.organic = Math.floor(Math.random() * 100);
      statsDto.date = new Date();

      await this.create(statsDto);
    }
  }
}
