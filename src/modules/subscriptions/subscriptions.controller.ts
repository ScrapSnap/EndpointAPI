import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {Keys, Subscription} from './schemas/subscription.schema';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from "../auth/auth.guard";
import {CreateSubscriptionDto} from "./dto/create-subscription.dto";

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() request: Request, @Body() subscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = new Subscription();
    subscription.userId = request['user'].userId;
    subscription.endpoint = subscriptionDto.endpoint;
    subscription.keys = new Keys();
    subscription.keys.p256dh = subscriptionDto.keys.p256dh;
    subscription.keys.auth = subscriptionDto.keys.auth;

    return this.subscriptionService.create(subscription);
  }

  @Post('sendNotification')
  async sendNotification(@Body() body: { title: string, message: string }) {
    const { title, message } = body;
    return this.subscriptionService.sendNotificationToAll(title, message);
  }

  @Post('sendNotificationToUser')
  async sendNotificationToUser(@Body() body: { userId: string, title: string, message: string }) {
    const { userId, title, message } = body;
    return this.subscriptionService.sendNotificationToUser(userId, title, message);
  }

  @Post('notifyUsers')
  async sendNotificationToUsersTest(@Body() body: { userIds: string[], title: string, message: string }) {
    return this.subscriptionService.checkAndNotifyUsersGarbageCollection();
  }
}
