import { Controller, Get, Post, Put, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BodyTrackingService } from './body-tracking.service';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto';
import { UpdateBodyTrackingConfigDto } from './dto/update-config.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@Controller('body-metrics')
@UseGuards(JwtAuthGuard)
export class BodyTrackingController {
  constructor(private readonly bodyTrackingService: BodyTrackingService) {}

  @Post('sessions')
  async createSession(@CurrentUser() user: JwtPayload, @Body() createDto: CreateSessionDto) {
    return this.bodyTrackingService.createSession(user.sub, createDto);
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.bodyTrackingService.getSessions(user.sub);
  }

  @Get()
  async getAllMetrics(@CurrentUser() user: JwtPayload) {
    return this.bodyTrackingService.getHistory(user.sub);
  }

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

  @Post('photos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPhotoDto,
  ) {
    return this.bodyTrackingService.uploadPhoto(user.sub, file, uploadDto);
  }

  @Get('photos')
  async getPhotos(@CurrentUser() user: JwtPayload) {
    return this.bodyTrackingService.getPhotos(user.sub);
  }
}

