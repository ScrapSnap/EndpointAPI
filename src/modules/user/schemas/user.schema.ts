import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDoc = Document & User;

@Schema({ collection: 'users' })
export class User {
  _id: string;

  @Prop({ type: Date })
  createdAt: string;

  @Prop({ index: true })
  firstname: string;

  @Prop({ index: true })
  lastname: string;

  @Prop()
  password: string;

  @Prop({ type: Date })
  updatedAt: string;

  @Prop({ unique: true, index: true })
  username: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
