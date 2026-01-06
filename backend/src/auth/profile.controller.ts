import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.sub);
    if (!user) {
      throw new NotFoundException('Utente non trovato');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.profile?.name || user.email,
      profile: user.profile,
      settings: user.settings,
    };
  }

  @Patch()
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.userService.updateProfile(req.user.sub, updateProfileDto);

    return {
      id: user.id,
      email: user.email,
      name: user.profile?.name || user.email,
      profile: user.profile,
      settings: user.settings,
    };
  }
}
