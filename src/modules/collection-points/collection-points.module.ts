import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionPointsService } from './collection-points.service';
import { CollectionPointsController } from './collection-points.controller';
import { CollectionPoint, CollectionPointSchema } from './schemas/collection-point.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from "../permissions/permission.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: CollectionPoint.name, schema: CollectionPointSchema }]),
  ],
  controllers: [CollectionPointsController],
  providers: [CollectionPointsService, AuthGuard, JwtService, PermissionsGuard],
})
export class CollectionPointsModule {}
