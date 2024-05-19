import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Keys {
  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;
}

export const KeysSchema = SchemaFactory.createForClass(Keys);

@Schema()
export class Subscription extends Document {
  @Prop({ required: true })
  endpoint: string;

  @Prop({ type: KeysSchema, required: true })
  keys: Keys;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);