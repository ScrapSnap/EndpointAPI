import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from "../permissions/permission.guard";
import { JwtService } from '@nestjs/jwt';
import { Permission } from '../roles/enums/permissions.enum';


describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionsService, AuthGuard, JwtService, PermissionsGuard, {
        provide: getModelToken(Subscription.name),
        useValue: SubscriptionSchema,
      }],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
