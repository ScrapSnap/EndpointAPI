import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from "../permissions/permission.guard";
import { JwtService } from '@nestjs/jwt';
import { Permission } from '../roles/enums/permissions.enum';


describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [SubscriptionsService, AuthGuard, JwtService, PermissionsGuard, {
        provide: getModelToken(Subscription.name),
        useValue: SubscriptionSchema,
      }],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
