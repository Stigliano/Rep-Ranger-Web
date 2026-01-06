import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrainingLogService } from './training-log.service';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('training-logs')
@UseGuards(JwtAuthGuard)
export class TrainingLogController {
  constructor(private readonly trainingLogService: TrainingLogService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateWorkoutLogDto) {
    return this.trainingLogService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.trainingLogService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.trainingLogService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateWorkoutLogDto) {
    return this.trainingLogService.update(id, req.user.sub, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.trainingLogService.remove(id, req.user.sub);
  }
}
