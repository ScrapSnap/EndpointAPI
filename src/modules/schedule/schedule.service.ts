import { Injectable } from '@nestjs/common';
import { Schedule } from './schemas/schedule.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { frequencyValues, garbageTypeValues } from '../utils/enum-utils';
import { GarbageType } from '../utils/schemas/garbage-type.enum';
import { Frequency } from '../utils/schemas/frequency.enum';

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
    return this.scheduleModel.findByIdAndUpdate(id, schedule).exec();
  }

  async delete(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<any> {
    return this.scheduleModel.deleteMany().exec();
  }

  async findScheduleByGarbageType(garbageType: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ garbageType: garbageType }).exec();
  }

  async findScheduleByLocation(location: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ location }).exec();
  }

  async findScheduleByFrequency(frequency: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ frequency }).exec();
  }

  async replaceAllSchedules(schedules: CreateScheduleDto[]): Promise<any> {
    await this.scheduleModel.deleteMany().exec();
    await this.scheduleModel.insertMany(schedules);
    return this.scheduleModel.find().exec();
  }

  async initDefaultSchedules(): Promise<void> {

    if (await this.scheduleModel.countDocuments().exec() > 0) {
      return;
    }

    console.log("Initializing default schedules");

    let garbageTypeSize = garbageTypeValues.length;
    let frequencySize = frequencyValues.length;
    let locations = [
      "Murska Sobota",
      "Maribor",
      "Ljubljana",
      "Novo gorica",
      "Koper",
    ]
  
    for (let i = 0; i < 5; i++) {
        let Schedule = new CreateScheduleDto();

        let garbageTypeIndex = Math.floor(Math.random() * garbageTypeSize);
        let garbageType = garbageTypeValues[garbageTypeIndex] as GarbageType;

        let frequencyIndex = Math.floor(Math.random() * frequencySize);
        let frequency = frequencyValues[frequencyIndex] as Frequency;

        //console.log(`garbageTypeIndex: ${garbageTypeIndex}, garbageType: ${garbageType}`);
        //console.log(`frequencyIndex: ${frequencyIndex}, frequency: ${frequency}`);

        function getRandomDate(start: Date, end: Date): Date {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);

        const randomDate = getRandomDate(startDate, endDate);

        Schedule.garbageType = garbageType;
        Schedule.location = locations[Math.floor(Math.random() * locations.length)];
        Schedule.frequency = frequency;
        Schedule.date = randomDate;
        Schedule.footnote = "Please put the garbage outside your house by 7:00.";

        try {
            await this.create(Schedule);
            console.log('Schedule created successfully');
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    }
  }
}
