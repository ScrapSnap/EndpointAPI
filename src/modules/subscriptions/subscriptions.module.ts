import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Schedule, ScheduleSchema } from "../schedule/schemas/schedule.schema";
import { User, UserSchema } from "../user/schemas/user.schema";

dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
    MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, AuthGuard, JwtService],
})
export class SubscriptionsModule {}
