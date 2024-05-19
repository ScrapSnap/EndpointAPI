import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ImageSnapDoc = ImageSnap & Document;

@Schema({ collection: 'image-snap' })
export class ImageSnap {
    _id: string;

    @Prop({ required: true, type: String})
    userId: string;

    @Prop({ required: true, type: String})
    fileName: string;

    @Prop({ required: true, type: String})
    bucketName: string;

    @Prop({ required: true, type: String})
    fileEtag: string;

    @Prop({ required: true, type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ required: true, type: Number})
    longitude: number;

    @Prop({ required: true, type: Number})
    latitude: number;
}

export const ImageSnapSchema = SchemaFactory.createForClass(ImageSnap);
