import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BodyMetric } from '../entities/body-metric.entity';
import { BodyTrackingConfig } from '../entities/body-tracking-config.entity';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto';
import { UpdateBodyTrackingConfigDto } from './dto/update-config.dto';

import { BodyProgressPhoto } from '../entities/body-progress-photo.entity';
import { BodyTrackingSession } from '../entities/body-tracking-session.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { LocalStorageService } from '../common/storage.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { BodyCompositionCalculator, BodyMetricsInput } from './body-composition.calculator';
import { METRIC_TYPES } from './constants/metric-types.constant';

@Injectable()
export class BodyTrackingService {
  constructor(
    @InjectRepository(BodyMetric)
    private bodyMetricRepository: Repository<BodyMetric>,
    @InjectRepository(BodyTrackingConfig)
    private configRepository: Repository<BodyTrackingConfig>,
    @InjectRepository(BodyProgressPhoto)
    private photoRepository: Repository<BodyProgressPhoto>,
    @InjectRepository(BodyTrackingSession)
    private sessionRepository: Repository<BodyTrackingSession>,
    @InjectRepository(UserProfileEntity)
    private userProfileRepository: Repository<UserProfileEntity>,
    private storageService: LocalStorageService,
    private dataSource: DataSource,
    private calculator: BodyCompositionCalculator,
  ) {}

  async createSession(userId: string, createDto: CreateSessionDto): Promise<BodyTrackingSession> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const session = this.sessionRepository.create({
        userId,
        date: new Date(createDto.date),
        weight: createDto.weight,
        notes: createDto.notes,
      });

      const savedSession = await queryRunner.manager.save(session);

      // Update photos with session ID
      if (createDto.photoIds && createDto.photoIds.length > 0) {
        await queryRunner.manager.update(
          BodyProgressPhoto,
          createDto.photoIds,
          { sessionId: savedSession.id }
        );
      }

      // If weight is provided, save it as a metric as well
      if (createDto.weight) {
        const metric = this.bodyMetricRepository.create({
          userId,
          metricType: 'weight',
          value: createDto.weight,
          unit: 'kg',
          measuredAt: new Date(createDto.date),
        });
        await queryRunner.manager.save(metric);
      }

      await queryRunner.commitTransaction();
      
      return this.sessionRepository.findOne({ 
        where: { id: savedSession.id },
        relations: ['photos']
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getSessions(userId: string): Promise<BodyTrackingSession[]> {
    return this.sessionRepository.find({
      where: { userId },
      relations: ['photos'],
      order: { date: 'DESC' },
    });
  }

  async uploadPhoto(userId: string, file: Express.Multer.File, uploadDto: UploadPhotoDto): Promise<BodyProgressPhoto> {
    const photoUrl = await this.storageService.uploadFile(file, `users/${userId}/photos`);
    
    const photo = this.photoRepository.create({
      userId,
      photoUrl,
      viewType: uploadDto.viewType,
      date: new Date(uploadDto.date),
      notes: uploadDto.notes,
    });
    
    return this.photoRepository.save(photo);
  }

  async getPhotos(userId: string): Promise<BodyProgressPhoto[]> {
    return this.photoRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async createMetric(userId: string, createDto: CreateBodyMetricDto): Promise<BodyMetric> {
    const metric = this.bodyMetricRepository.create({
      userId,
      ...createDto,
      measuredAt: new Date(createDto.measuredAt),
    });
    return this.bodyMetricRepository.save(metric);
  }

  async getHistory(userId: string): Promise<BodyMetric[]> {
    return this.bodyMetricRepository.find({
      where: { userId },
      order: { measuredAt: 'DESC' },
    });
  }

  async getConfig(userId: string): Promise<BodyTrackingConfig> {
    let config = await this.configRepository.findOne({ where: { userId } });
    if (!config) {
      config = this.configRepository.create({ userId });
      await this.configRepository.save(config);
    }
    return config;
  }

  async updateConfig(userId: string, updateDto: UpdateBodyTrackingConfigDto): Promise<BodyTrackingConfig> {
    let config = await this.getConfig(userId);
    this.configRepository.merge(config, updateDto);
    return this.configRepository.save(config);
  }

  async getAnalysis(userId: string, userGender: 'male' | 'female' = 'male') {
    const config = await this.getConfig(userId);
    const latestMetrics = await this.getLatestMetrics(userId);
    
    // Fetch user profile for more accurate data
    const profile = await this.userProfileRepository.findOne({ where: { userId } });
    const gender = (profile?.gender as 'male' | 'female') || userGender;
    const age = profile?.age || 30; // Default age if not set

    // Default values if missing (from prototype REFS)
    const defaults = {
      male: { wrist: 17, waist: 84 },
      female: { wrist: 15, waist: 68 }
    };

    // Use specific side measurements if available, else fallback to generic or defaults
    const wrist = latestMetrics[METRIC_TYPES.WRIST_RIGHT] || latestMetrics[METRIC_TYPES.WRIST_LEFT] || latestMetrics[METRIC_TYPES.WRIST] || defaults[gender].wrist;
    const waist = latestMetrics[METRIC_TYPES.WAIST] || defaults[gender].waist;

    let calculatedTargets = {};

    if (config.targetMethod === 'casey_butt') {
      const ratios = {
        male: { chest: 6.5, shoulders: 7.2, waist: 4.8, hips: 5.8, bicep: 2.15, forearm: 1.75, thigh: 3.5, calf: 2.3, neck: 2.4 },
        female: { chest: 5.8, shoulders: 6.4, waist: 4.3, hips: 6.4, bicep: 1.8, forearm: 1.55, thigh: 3.6, calf: 2.25, neck: 2.0 }
      };
      const r = ratios[gender];
      calculatedTargets = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(wrist * (v as number))]));
    } else if (config.targetMethod === 'golden_ratio') {
      calculatedTargets = {
        shoulders: Math.round(waist * 1.618),
        chest: Math.round(waist * 1.4),
        hips: Math.round(waist * (gender === 'male' ? 1.15 : 1.4)),
        bicep: Math.round(waist * 0.36),
        thigh: Math.round(waist * 0.65),
        calf: Math.round(waist * 0.4),
        neck: Math.round(waist * 0.44)
      };
    }

    // Merge with custom targets
    const finalTargets = { ...calculatedTargets, ...(config.customTargets || {}) };

    // Calculate deviations
    const analysis = Object.entries(finalTargets).map(([part, target]) => {
      // Handle L/R metrics by averaging or taking available
      let current = latestMetrics[part];
      if (!current) {
        // Try to find L/R variants if part is generic (e.g. 'bicep')
        const left = latestMetrics[`${part}_left`];
        const right = latestMetrics[`${part}_right`];
        if (left && right) current = (left + right) / 2;
        else if (left) current = left;
        else if (right) current = right;
      }

      if (!current) return null;
      
      const ideal = target as number;
      const dev = ((current - ideal) / ideal) * 100;
      let status = Math.abs(dev) <= 12 ? 'optimal' : (dev > 12 ? 'over' : 'under');
      if (part === 'waist') status = dev <= 0 ? 'optimal' : (dev > 12 ? 'over' : 'optimal');

      return { part, ideal, current: Math.round(current * 10) / 10, deviation: Math.round(dev), status };
    }).filter(Boolean);

    // Body Composition Calculation
    const compInput: BodyMetricsInput = {
      gender,
      age,
      weight: latestMetrics[METRIC_TYPES.WEIGHT],
      height: latestMetrics[METRIC_TYPES.HEIGHT],
      waist: latestMetrics[METRIC_TYPES.WAIST],
      hips: latestMetrics[METRIC_TYPES.HIPS],
      neck: latestMetrics[METRIC_TYPES.NECK],
      skinfold_chest: latestMetrics[METRIC_TYPES.SKINFOLD_CHEST],
      skinfold_midaxillary: latestMetrics[METRIC_TYPES.SKINFOLD_MIDAXILLARY],
      skinfold_tricep: latestMetrics[METRIC_TYPES.SKINFOLD_TRICEP],
      skinfold_subscapular: latestMetrics[METRIC_TYPES.SKINFOLD_SUBSCAPULAR],
      skinfold_abdominal: latestMetrics[METRIC_TYPES.SKINFOLD_ABDOMINAL],
      skinfold_suprailiac: latestMetrics[METRIC_TYPES.SKINFOLD_SUPRAILIAC],
      skinfold_thigh: latestMetrics[METRIC_TYPES.SKINFOLD_THIGH],
    };

    const composition = this.calculator.calculate(compInput);

    return {
      method: config.targetMethod,
      targets: finalTargets,
      analysis,
      composition
    };
  }

  private async getLatestMetrics(userId: string): Promise<Record<string, number>> {
    // Get latest metric for each type
    const metrics = await this.bodyMetricRepository
      .createQueryBuilder('bm')
      .distinctOn(['bm.metric_type'])
      .select('bm.metric_type', 'type')
      .addSelect('bm.value', 'value')
      .addSelect('bm.unit', 'unit')
      .where('bm.user_id = :userId', { userId })
      .orderBy('bm.metric_type')
      .addOrderBy('bm.measured_at', 'DESC')
      .getRawMany();

    return metrics.reduce((acc, m) => {
      let value = parseFloat(m.value);
      
      // Normalize to kg and cm
      if (m.unit === 'lbs') {
        value = value * 0.453592;
      } else if (m.unit === 'inches') {
        value = value * 2.54;
      }
      
      acc[m.type] = Math.round(value * 100) / 100;
      return acc;
    }, {});
  }
}

