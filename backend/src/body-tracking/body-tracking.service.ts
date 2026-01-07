import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyMetric } from '../entities/body-metric.entity';
import { BodyTrackingConfig } from '../entities/body-tracking-config.entity';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto';
import { UpdateBodyTrackingConfigDto } from './dto/update-config.dto';

@Injectable()
export class BodyTrackingService {
  constructor(
    @InjectRepository(BodyMetric)
    private bodyMetricRepository: Repository<BodyMetric>,
    @InjectRepository(BodyTrackingConfig)
    private configRepository: Repository<BodyTrackingConfig>,
  ) {}

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
    
    // Default values if missing (from prototype REFS)
    const defaults = {
      male: { wrist: 17, waist: 84 },
      female: { wrist: 15, waist: 68 }
    };

    const wrist = latestMetrics['wrist'] || defaults[userGender].wrist;
    const waist = latestMetrics['waist'] || defaults[userGender].waist;

    let calculatedTargets = {};

    if (config.targetMethod === 'casey_butt') {
      const ratios = {
        male: { chest: 6.5, shoulders: 7.2, waist: 4.8, hips: 5.8, bicep: 2.15, forearm: 1.75, thigh: 3.5, calf: 2.3, neck: 2.4 },
        female: { chest: 5.8, shoulders: 6.4, waist: 4.3, hips: 6.4, bicep: 1.8, forearm: 1.55, thigh: 3.6, calf: 2.25, neck: 2.0 }
      };
      const r = ratios[userGender];
      calculatedTargets = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(wrist * (v as number))]));
    } else if (config.targetMethod === 'golden_ratio') {
      calculatedTargets = {
        shoulders: Math.round(waist * 1.618),
        chest: Math.round(waist * 1.4),
        hips: Math.round(waist * (userGender === 'male' ? 1.15 : 1.4)),
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
      const current = latestMetrics[part];
      if (!current) return null;
      
      const ideal = target as number;
      const dev = ((current - ideal) / ideal) * 100;
      let status = Math.abs(dev) <= 12 ? 'optimal' : (dev > 12 ? 'over' : 'under');
      if (part === 'waist') status = dev <= 0 ? 'optimal' : (dev > 12 ? 'over' : 'optimal');

      return { part, ideal, current, deviation: Math.round(dev), status };
    }).filter(Boolean);

    return {
      method: config.targetMethod,
      targets: finalTargets,
      analysis
    };
  }

  private async getLatestMetrics(userId: string): Promise<Record<string, number>> {
    // Get latest metric for each type
    // This could be optimized with a custom query
    const metrics = await this.bodyMetricRepository
      .createQueryBuilder('bm')
      .select('DISTINCT ON (bm.metric_type) bm.metric_type', 'type')
      .addSelect('bm.value', 'value')
      .where('bm.user_id = :userId', { userId })
      .orderBy('bm.metric_type')
      .addOrderBy('bm.measured_at', 'DESC')
      .getRawMany();

    return metrics.reduce((acc, m) => {
      acc[m.type] = parseFloat(m.value);
      return acc;
    }, {});
  }
}

