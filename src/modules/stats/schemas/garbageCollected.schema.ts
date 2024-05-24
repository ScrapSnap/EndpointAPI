import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class GarbageCollected {
  @Prop({ required: false, default: 0})
  paper: number;

  @Prop({ required: false, default: 0 })
  plastic: number;

  @Prop({ required: false, default: 0 })
  glass: number;

  @Prop({ required: false, default: 0 })
  metal: number;

  @Prop({ required: false, default: 0 })
  organic: number;
}

export const GarbageCollectedSchema = SchemaFactory.createForClass(GarbageCollected);
