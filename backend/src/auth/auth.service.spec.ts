import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';

/**
 * Unit test per AuthService
 * Testa logica di business per autenticazione, registrazione e gestione token
 */
describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  // Mock utente per i test
  const mockUser: UserEntity = {
    id: 'test-user-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    emailVerified: false,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'test-user-id',
      name: 'Test User',
    } as UserProfileEntity,
    settings: null,
  };

  beforeEach(async () => {
    // Mock JwtService
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          JWT_EXPIRATION: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '30d',
        };
        return config[key] || defaultValue;
      }),
    };

    // Mock UserService
    const mockUserService = {
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('dovrebbe ritornare utente se credenziali valide', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.validatePassword).toHaveBeenCalledWith(password, mockUser.passwordHash);
    });

    it('dovrebbe ritornare null se utente non trovato', async () => {
      // Arrange
      const email = 'notfound@example.com';
      const password = 'password123';
      userService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.validatePassword).not.toHaveBeenCalled();
    });

    it('dovrebbe ritornare null se password non valida', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.validatePassword).toHaveBeenCalledWith(password, mockUser.passwordHash);
    });
  });

  describe('login', () => {
    it('dovrebbe generare token e aggiornare ultimo login', async () => {
      // Arrange
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      jwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      userService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toHaveProperty('accessToken', accessToken);
      expect(result).toHaveProperty('refreshToken', refreshToken);
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.name).toBe(mockUser.profile.name);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(userService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('dovrebbe usare email come nome se profilo non presente', async () => {
      // Arrange
      const userWithoutProfile = { ...mockUser, profile: null };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      jwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      userService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await service.login(userWithoutProfile);

      // Assert
      expect(result.user.name).toBe(userWithoutProfile.email);
    });
  });

  describe('register', () => {
    it('dovrebbe creare nuovo utente e fare login automatico', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const password = 'password123';
      const name = 'New User';
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      userService.emailExists.mockResolvedValue(false);
      userService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      userService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await service.register(email, password, name);

      // Assert
      expect(userService.emailExists).toHaveBeenCalledWith(email);
      expect(userService.create).toHaveBeenCalledWith(email, password, name);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('dovrebbe lanciare BadRequestException se email già registrata', async () => {
      // Arrange
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'Existing User';
      userService.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(service.register(email, password, name)).rejects.toThrow(BadRequestException);
      expect(userService.emailExists).toHaveBeenCalledWith(email);
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare BadRequestException se password troppo corta', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const password = 'short'; // meno di 8 caratteri
      const name = 'New User';
      userService.emailExists.mockResolvedValue(false);

      // Act & Assert
      await expect(service.register(email, password, name)).rejects.toThrow(BadRequestException);
      expect(userService.emailExists).toHaveBeenCalledWith(email);
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('dovrebbe generare nuovo access token se refresh token valido', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';
      const payload = { sub: mockUser.id, email: mockUser.email };

      jwtService.verify.mockReturnValue(payload);
      userService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(newAccessToken);

      // Act
      const result = await service.refreshToken(refreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken', newAccessToken);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException se refresh token non valido', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token non valido');
      });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(userService.findById).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException se utente non trovato', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'non-existent-id', email: 'test@example.com' };

      jwtService.verify.mockReturnValue(payload);
      userService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(userService.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('verifyToken', () => {
    it('dovrebbe ritornare payload se token valido', async () => {
      // Arrange
      const token = 'valid-token';
      const payload = { sub: mockUser.id, email: mockUser.email };
      jwtService.verify.mockReturnValue(payload);

      // Act
      const result = await service.verifyToken(token);

      // Assert
      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('dovrebbe lanciare UnauthorizedException se token non valido', async () => {
      // Arrange
      const token = 'invalid-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token non valido');
      });

      // Act & Assert
      await expect(service.verifyToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });
});
