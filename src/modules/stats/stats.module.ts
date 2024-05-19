import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Stat, StatSchema } from './schemas/stat.schema';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';

dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Stat.name, schema: StatSchema }]),
  ],
  controllers: [StatsController],
  providers: [StatsService, AuthGuard, JwtService],
})

export class StatsModule {}