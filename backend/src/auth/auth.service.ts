import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserEntity } from '../entities/user.entity';

/**
 * Payload JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
}

/**
 * Risposta login
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Servizio autenticazione
 * Gestisce login, registrazione e refresh token
 * Conforme a 3_SOFTWARE_ARCHITECTURE.md sezione 2.6
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Valida credenziali utente
   */
  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await this.userService.validatePassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Login utente
   */
  async login(user: UserEntity): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      payload,
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
      },
    );

    // Aggiorna ultimo login
    await this.userService.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name || user.email,
      },
    };
  }

  /**
   * Registrazione nuovo utente
   */
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<LoginResponse> {
    // Verifica se email esiste già
    const emailExists = await this.userService.emailExists(email);
    if (emailExists) {
      throw new BadRequestException('Email già registrata');
    }

    // Validazione password base
    if (password.length < 8) {
      throw new BadRequestException('Password deve essere almeno 8 caratteri');
    }

    // Crea utente
    const user = await this.userService.create(email, password, name);

    // Login automatico dopo registrazione
    return this.login(user);
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Utente non trovato');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token non valido');
    }
  }

  /**
   * Verifica token JWT
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Token non valido');
    }
  }
}

