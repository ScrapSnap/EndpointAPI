import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { GarbageCollected, GarbageCollectedSchema } from './garbageCollected.schema';

export type StatDoc = Stat & Document;

@Schema({ collection: 'stat' })
export class Stat {

  _id: string;

  @Prop({ required: true, type: String})
  userId: string;

  @Prop({ required: true, type: Date})
  date: Date;

  @Prop({ type: GarbageCollectedSchema, required: true })
  garbageCollected: GarbageCollected;
}

export const StatSchema = SchemaFactory.createForClass(Stat);