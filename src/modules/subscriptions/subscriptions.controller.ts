import { Controller, Post, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './schemas/subscription.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post()
  async create(@Body() subscription: Subscription): Promise<Subscription> {
    return this.subscriptionService.create(subscription);
  }

  @Post('sendNotification')
  async sendNotification(@Body('message') message: string) {
    return this.subscriptionService.sendNotification(message);
  }
}
