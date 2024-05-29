import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { getModelToken } from '@nestjs/mongoose';
import { Stat, StatSchema } from './schemas/stat.schema';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from "../permissions/permission.guard";
import { JwtService } from '@nestjs/jwt';

describe('StatsController', () => {
  let statsController: StatsController;
  let statsService: StatsService;
  let statModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        StatsService,
        AuthGuard,
        JwtService,
        PermissionsGuard,
        {
          provide: getModelToken(Stat.name),
          useValue: statModel,
        },
      ],
    }).compile();

    statsService = moduleRef.get<StatsService>(StatsService);
    statsController = moduleRef.get<StatsController>(StatsController);
  });

  it('should be defined', () => {
    expect(statsController).toBeDefined();
    expect(statsService).toBeDefined();
  });
});
