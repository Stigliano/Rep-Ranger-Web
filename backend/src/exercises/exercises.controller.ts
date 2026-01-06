import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseDto } from './dto/exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MuscleGroup } from '../entities/exercise.entity';

import { Equipment } from '../entities/exercise.entity';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async findAll(
    @Query('muscleGroup') muscleGroup?: MuscleGroup,
    @Query('equipment') equipment?: Equipment,
    @Query('search') search?: string,
  ): Promise<ExerciseDto[]> {
    return this.exercisesService.findAll(muscleGroup, equipment, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ExerciseDto> {
    return this.exercisesService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateExerciseDto): Promise<ExerciseDto> {
    return this.exercisesService.create(createDto);
  }

  @Post('seed')
  async seed(): Promise<void> {
    return this.exercisesService.seed();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExerciseDto,
  ): Promise<ExerciseDto> {
    return this.exercisesService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.exercisesService.remove(id);
  }
}
