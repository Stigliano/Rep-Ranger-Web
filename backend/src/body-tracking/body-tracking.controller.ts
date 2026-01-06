import { Controller, Get, Post, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
import { BodyTrackingService } from './body-tracking.service';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto';
import { UpdateBodyTrackingConfigDto } from './dto/update-config.dto';
// Assuming JwtAuthGuard exists in ../auth/guards/jwt-auth.guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('body-metrics')
// @UseGuards(JwtAuthGuard) // Uncomment when integrating
export class BodyTrackingController {
  constructor(private readonly bodyTrackingService: BodyTrackingService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateBodyMetricDto) {
    // const userId = req.user.id;
    const userId = 'temp-user-id'; // Mock for now
    return this.bodyTrackingService.createMetric(userId, createDto);
  }

  @Get('history')
  async getHistory(@Request() req) {
    // const userId = req.user.id;
    const userId = 'temp-user-id';
    return this.bodyTrackingService.getHistory(userId);
  }

  @Get('config')
  async getConfig(@Request() req) {
    // const userId = req.user.id;
    const userId = 'temp-user-id';
    return this.bodyTrackingService.getConfig(userId);
  }

  @Put('config')
  async updateConfig(@Request() req, @Body() updateDto: UpdateBodyTrackingConfigDto) {
    // const userId = req.user.id;
    const userId = 'temp-user-id';
    return this.bodyTrackingService.updateConfig(userId, updateDto);
  }

  @Get('analysis')
  async getAnalysis(@Request() req, @Query('gender') gender: 'male' | 'female') {
    // const userId = req.user.id;
    // const gender = req.user.profile.gender || 'male'; // Real implementation
    const userId = 'temp-user-id';
    return this.bodyTrackingService.getAnalysis(userId, gender);
  }
}

