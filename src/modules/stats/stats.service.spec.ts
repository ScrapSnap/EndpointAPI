import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Stat, StatSchema } from './schemas/stat.schema';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PermissionsGuard } from '../permissions/permission.guard';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { CreateStatDto } from './dto/create-stat.dto';
import { GarbageCollected } from './schemas/garbageCollected.schema';


jest.setTimeout(30000);

describe('StatsService', () => {
  let service: StatsService;
  let mongod: MongoMemoryServer;
  let uri: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Stat.name, schema: StatSchema }]),
      ],
      providers: [
        StatsService,
        AuthGuard,
        JwtService,
        PermissionsGuard,
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  afterEach(async () => {
    await service.deleteAll();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a stat', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    const stat = await service.create(createStatDto);
    expect(stat).toBeDefined();
    expect(stat.userId).toBe(createStatDto.userId);
  });

  it('should find all stats', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    await service.create(createStatDto);
    const stats = await service.findAll();
    expect(stats).toBeDefined();
    expect(stats.length).toBe(1);
  });

  it('should find a stat by id', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    const stat = await service.create(createStatDto);
    const foundStat = await service.findOne(stat._id);
    expect(foundStat).toBeDefined();
    expect(foundStat.userId).toBe(createStatDto.userId);
  });

  it('should update a stat', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    const stat = await service.create(createStatDto);
    const updatedStat = await service.update(stat._id, { userId: '456' });
    expect(updatedStat).toBeDefined();
    expect(updatedStat.userId).toBe('456');
  });

  it('should delete a stat', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    const stat = await service.create(createStatDto);
    const deletedStat = await service.delete(stat._id);
    expect(deletedStat).toBeDefined();
    expect(deletedStat.userId).toBe(createStatDto.userId);
  });

  it('should delete all stats', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);

    const deletedStats = await service.deleteAll();
    expect(deletedStats).toBeDefined();
    expect(deletedStats.ok).toBe(undefined);
  });

  it('should find stats by user id', async () => {
    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: new Date(),
    };

    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);

    const stats = await service.findStatByUserId('123');

    expect(stats).toBeDefined();
    expect(stats.length).toBe(1);

  });

  it('should find stats by date', async () => {

    const date = new Date();

    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 1,
        glass: 1,
        metal: 1,
        organic: 1,
      },
      date: date,
    };

    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);

    const stats = await service.findStatByDate(date);

    expect(stats).toBeDefined();
    expect(stats.length).toBe(5);

  });

  it('should find stats with garbage type', async () => {

    const garbageType = 'paper';

    const createStatDto: CreateStatDto = {
      userId: '123',
      garbageCollected: {
        paper: 1,
        plastic: 0,
        glass: 0,
        metal: 0,
        organic: 0,
      },
      date: new Date(),
    };

    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);
    await service.create(createStatDto);

    const stats = await service.findWithGarbageType(garbageType);

    expect(stats).toBeDefined();
    expect(stats.length).toBe(5);

  });

  it('should init default stats', async () => {

    const userId = '123';

    await service.initDefaultStats(userId);

    const stats = await service.findStatByUserId(userId);

    expect(stats).toBeDefined();
    expect(stats.length).toBe(1);

  });
});
