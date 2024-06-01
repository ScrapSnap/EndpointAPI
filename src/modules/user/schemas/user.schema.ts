import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Role} from "../../roles/schemas/role.schema";
import {Types} from "mongoose";

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

  @Prop({ type: String })
  password: string;

  @Prop({ type: Date })
  updatedAt: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: String, required: true })
  roleId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
