import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { EnumModule } from './modules/utils/enum.module';
import { ImageSnapsModule } from './modules/image-snaps/image-snaps.module';
import { CollectionPointsModule } from './modules/collection-points/collection-points.module';
import { StatsModule } from './modules/stats/stats.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [UserModule, AuthModule, ScheduleModule, EnumModule, CollectionPointsModule, StatsModule, SubscriptionsModule, ImageSnapsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
