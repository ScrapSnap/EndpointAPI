import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RoleDoc = Role & Document;

@Schema({ collection: 'roles' })
export class Role {
    _id: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: [Number] })
    permissions: number[];

    @Prop({ required: true, type: Boolean })
    isDefault: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
