import { Controller, Get, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { BodyTrackingService } from './body-tracking.service';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto';
import { UpdateBodyTrackingConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@Controller('body-metrics')
@UseGuards(JwtAuthGuard)
export class BodyTrackingController {
  constructor(private readonly bodyTrackingService: BodyTrackingService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateBodyMetricDto) {
    return this.bodyTrackingService.createMetric(user.sub, createDto);
  }

  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.bodyTrackingService.getHistory(user.sub);
  }

  @Get('config')
  async getConfig(@CurrentUser() user: JwtPayload) {
    return this.bodyTrackingService.getConfig(user.sub);
  }

  @Put('config')
  async updateConfig(@CurrentUser() user: JwtPayload, @Body() updateDto: UpdateBodyTrackingConfigDto) {
    return this.bodyTrackingService.updateConfig(user.sub, updateDto);
  }

  @Get('analysis')
  async getAnalysis(@CurrentUser() user: JwtPayload, @Query('gender') gender: 'male' | 'female') {
    // Il gender potrebbe essere preso dal profilo utente se disponibile, ma per ora lo manteniamo come parametro query opzionale
    // o fallback su quello del profilo.
    // Per ora l'implementazione del service gestisce il default
    return this.bodyTrackingService.getAnalysis(user.sub, gender);
  }
}

