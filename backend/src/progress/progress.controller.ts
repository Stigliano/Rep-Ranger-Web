import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { ProgressStatsDto } from './dto/progress-stats.dto';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('stats')
  async getStats(@Request() req): Promise<ProgressStatsDto> {
    return this.progressService.getStats(req.user.id);
  }
}
