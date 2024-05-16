import { Injectable } from '@nestjs/common';
import { Schedule} from './schemas/schedule.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<Schedule>) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return createdSchedule.save();
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel.find().exec();
  }

  async findOne(id: string): Promise<Schedule> {
    return this.scheduleModel.findById(id).exec();
  }

  async update(id: string, schedule: Schedule): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndUpdate(id, schedule, { new: true }).exec();
  }

  async delete(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<any> {
    return this.scheduleModel.deleteMany().exec();
  }

  async findScheduleByGarbageType(garbagetype: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ garbagetype }).exec();
  }

  async findScheduleByLocation(location: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ location }).exec();
  }

  async findScheduleByFrequency(frequency: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ frequency }).exec();
  }
}