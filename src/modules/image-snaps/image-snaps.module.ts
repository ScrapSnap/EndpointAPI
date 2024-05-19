import { Module } from '@nestjs/common';
import { ImageSnapsService } from './image-snaps.service';
import { ImageSnapsController } from './image-snaps.controller';
import { ConfigModule } from '@nestjs/config';
import { ImageSnap, ImageSnapSchema } from './schemas/image-snap.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),     
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: ImageSnap.name, schema: ImageSnapSchema }]),],
  controllers: [ImageSnapsController],
  providers: [ImageSnapsService],
})
export class ImageSnapsModule {}
