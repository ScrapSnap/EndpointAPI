import {Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import * as webpush from 'web-push';
import * as dotenv from 'dotenv';

dotenv.config();

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>
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
}
