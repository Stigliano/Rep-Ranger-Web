import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyTrackingController } from './body-tracking.controller';
import { BodyTrackingService } from './body-tracking.service';
import { BodyMetric } from '../entities/body-metric.entity';
import { BodyTrackingConfig } from '../entities/body-tracking-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BodyMetric, BodyTrackingConfig])],
  controllers: [BodyTrackingController],
  providers: [BodyTrackingService],
  exports: [BodyTrackingService],
})
export class BodyTrackingModule {}

