import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';

/**
 * Servizio per gestione utenti
 * Gestisce CRUD utenti e operazioni correlate
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly settingsRepository: Repository<UserSettingsEntity>,
  ) {}

  /**
   * Crea un nuovo utente con profilo e settings di default
   */
  async create(
    email: string,
    password: string,
    name: string,
  ): Promise<UserEntity> {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crea utente
    const user = this.userRepository.create({
      email,
      passwordHash,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Crea profilo di default
    const profile = this.profileRepository.create({
      userId: savedUser.id,
      name,
    });
    await this.profileRepository.save(profile);

    // Crea settings di default
    const settings = this.settingsRepository.create({
      userId: savedUser.id,
    });
    await this.settingsRepository.save(settings);

    return savedUser;
  }

  /**
   * Trova utente per email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'settings'],
    });
  }

  /**
   * Trova utente per ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'settings'],
    });
  }

  /**
   * Verifica password
   */
  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  /**
   * Aggiorna ultimo login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Verifica se email esiste
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }
}

