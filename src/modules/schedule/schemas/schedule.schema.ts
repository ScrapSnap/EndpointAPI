import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GarbageType } from 'src/modules/utils/schemas/garbage-type.enum';
import { Frequency } from 'src/modules/utils/schemas/frequency.enum';
import { IsEnum } from 'class-validator';

export type ScheduleDoc = Schedule & Document;

@Schema({ collection: 'schedule' })
export class Schedule {

  _id: string;

  @Prop({ required: true, enum: GarbageType })
  @IsEnum(GarbageType)
  garbageType: GarbageType;

  @Prop({ required: true, type: String})
  location: string;

  @Prop({ required: true, type: String})
  footnote: string;

  @Prop({ required: true, enum: Frequency })
  @IsEnum(Frequency)
  frequency: Frequency;

  @Prop({ required: true, type: Date})
  date: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  dateAdded: Date;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

