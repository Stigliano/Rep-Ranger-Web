import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyTrackingController } from './body-tracking.controller';
import { BodyTrackingService } from './body-tracking.service';
import { BodyMetric } from '../entities/body-metric.entity';
import { BodyTrackingConfig } from '../entities/body-tracking-config.entity';
import { BodyProgressPhoto } from '../entities/body-progress-photo.entity';
import { LocalStorageService } from '../common/storage.service';

import { BodyTrackingSession } from '../entities/body-tracking-session.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { BodyCompositionCalculator } from './body-composition.calculator';

@Module({
  imports: [TypeOrmModule.forFeature([BodyMetric, BodyTrackingConfig, BodyProgressPhoto, BodyTrackingSession, UserProfileEntity])],
  controllers: [BodyTrackingController],
  providers: [BodyTrackingService, LocalStorageService, BodyCompositionCalculator],
  exports: [BodyTrackingService],
})
export class BodyTrackingModule {}

