import {Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import { Cron } from '@nestjs/schedule';
import * as webpush from 'web-push';
import * as dotenv from 'dotenv';
import { Schedule } from "../schedule/schemas/schedule.schema";
import { User } from "../user/schemas/user.schema";

dotenv.config();

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(subscription: Subscription): Promise<Subscription> {
    const createdSubscription = new this.subscriptionModel(subscription);
    return createdSubscription.save();
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.find().exec();
  }

  async sendNotificationToAll(title: string, body: string) {
    const subscriptions = await this.subscriptionModel.find().exec();

    if (!subscriptions || !subscriptions.length) {
      throw new InternalServerErrorException('No subscriptions found');
    }

    const notificationPayload = {
      notification: {
        title: title,
        body: body,
        icon: 'icons/icon-64x64.png',
      },
    };

    const sendPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
    });

    await Promise.all(sendPromises);
    return true;
  }

  async sendNotificationToUser(userId: string, title: string, body: string) {
    const subscriptions = await this.subscriptionModel.find({ userId }).exec();

    if (!subscriptions || !subscriptions.length) {
      throw new InternalServerErrorException('User has no subscriptions');
    }

    const notificationPayload = {
      notification: {
        title: title,
        body: body,
        icon: 'icons/icon-64x64.png',
      },
    };

    const sendPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
    });

    await Promise.all(sendPromises);
    return true;
  }

  @Cron('0 16 * * *') // Runs every day at 16 PM
  async userGarbageCollectionNotifier() {
    await this.checkAndNotifyUsersGarbageCollection()
  }

  async checkAndNotifyUserGarbageCollection(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const subscriptions = await this.subscriptionModel.find({ userId }).exec();
    if (!subscriptions || !subscriptions.length) {
      throw new InternalServerErrorException('User has no subscriptions');
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // get schedule for tomorrow by user location
    const schedules = await this.scheduleModel.find({
        location: user.location,
        date: {
            $gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
            $lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1),
        }
    }).exec();

    if (!schedules || !schedules.length) {
      throw new InternalServerErrorException('No garbage collection scheduled for tomorrow');
    }

    for (const schedule of schedules) {
      const notificationPayload = {
        notification: {
          title: 'Don\'t forget to take out the trash today!',
          body: schedule.garbageType + ' garbage collection is scheduled for tomorrow',
          icon: 'icons/icon-64x64.png',
        },
      };

      const sendPromises = subscriptions.map(subscription => {
        return webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
      });

      await Promise.all(sendPromises);
    }

    return true;
  }

  async checkAndNotifyUsersGarbageCollection() {
    // get all schedules for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await this.scheduleModel.find({
        date: {
            $gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
            $lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1),
        }
    }).exec();

    const sendPromises = [];

    for (const schedule of schedules) {
      const users = await this.userModel.find({ location: schedule.location }).exec();
      if (!users || !users.length) {
        continue;
      }

      const userSubscriptions = await this.subscriptionModel.find({ userId: { $in: users.map(user => user.id) } }).exec();
      if (!userSubscriptions || !userSubscriptions.length) {
          continue;
      }

      // get only unique subscriptions per userId
      const uniqueUserSubscriptions = [];
      const userIds = [];
      for (const subscription of userSubscriptions) {
          if (!userIds.includes(subscription.userId)) {
              userIds.push(subscription.userId);
              uniqueUserSubscriptions.push(subscription);
          }
      }

      const notificationPayload = {
        notification: {
          title: 'Don\'t forget to take out the trash today!',
          body: schedule.garbageType + ' garbage collection is scheduled for tomorrow',
          icon: 'icons/icon-64x64.png',
        },
      };

      sendPromises.push(uniqueUserSubscriptions.map(subscription => {
        return webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
      }));
    }

    await Promise.all(sendPromises);
  }
}
