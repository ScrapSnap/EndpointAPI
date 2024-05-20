import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Keys {
  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;
}

const KeysSchema = SchemaFactory.createForClass(Keys);

@Schema({ collection: 'subscriptions' })
export class Subscription {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ type: KeysSchema, required: true })
  keys: Keys;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
