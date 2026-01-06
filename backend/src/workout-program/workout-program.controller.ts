import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkoutProgramService } from './workout-program.service';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';
import { WorkoutProgramDto } from './dto/workout-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProgramStatus } from '../entities/workout-program.entity';
import { JwtPayload } from '../auth/auth.service';

/**
 * Controller per gestione programmi di allenamento
 * Conforme a 3_SOFTWARE_ARCHITECTURE.md sezione 2.2
 */
@Controller('workout-programs')
@UseGuards(JwtAuthGuard)
export class WorkoutProgramController {
  constructor(private readonly workoutProgramService: WorkoutProgramService) {}

  /**
   * Lista tutti i programmi dell'utente
   */
  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<WorkoutProgramDto[]> {
    return this.workoutProgramService.findAll(user.sub);
  }

  /**
   * Dettaglio programma
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkoutProgramDto> {
    return this.workoutProgramService.findOne(id, user.sub);
  }

  /**
   * Crea nuovo programma
   */
  @Post()
  async create(
    @Body() createDto: CreateWorkoutProgramDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkoutProgramDto> {
    return this.workoutProgramService.create(user.sub, createDto);
  }

  /**
   * Aggiorna programma
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkoutProgramDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkoutProgramDto> {
    return this.workoutProgramService.update(id, user.sub, updateDto);
  }

  /**
   * Elimina programma
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<void> {
    return this.workoutProgramService.remove(id, user.sub);
  }

  /**
   * Aggiorna status programma
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProgramStatus,
    @CurrentUser() user: JwtPayload,
  ): Promise<WorkoutProgramDto> {
    return this.workoutProgramService.updateStatus(id, user.sub, status);
  }
}
