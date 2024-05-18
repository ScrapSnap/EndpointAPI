import { ApiResponseProperty } from '@nestjs/swagger';
import { Schedule } from '../schemas/schedule.schema';
import { IsEnum, IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { GarbageType } from '../../utils/schemas/garbage-type.enum';
import { Frequency } from '../../utils/schemas/frequency.enum';

export class ScheduleDto {
  @ApiResponseProperty()
  _id: string;

  @IsEnum(GarbageType)
  garbageType: GarbageType;

  @ApiResponseProperty()
  location: string;

  @ApiResponseProperty()
  footnote: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiResponseProperty()
  date: Date;

  @ApiResponseProperty()
  dateAdded: Date;

  constructor(args?: Partial<Schedule | ScheduleDto>) {
    this._id = args._id;
    this.garbageType = args.garbageType;
    this.location = args.location;
    this.footnote = args.footnote;
    this.frequency = args.frequency;
    this.date = args.date;
    this.dateAdded = args.dateAdded;
  }
}
