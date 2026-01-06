import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService, LoginResponse } from './auth.service';
import { UserService } from './user.service';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';

/**
 * Unit test per AuthController
 * Testa mapping endpoint e risposte HTTP
 */
describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  // Mock dati per i test
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
    settings: {
      userId: 'test-user-id',
    } as UserSettingsEntity,
  };

  const mockLoginResponse: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.profile.name,
    },
  };

  beforeEach(async () => {
    // Mock AuthService
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    };

    // Mock UserService
    const mockUserService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('dovrebbe registrare nuovo utente e ritornare LoginResponse', async () => {
      // Arrange
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      authService.register.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });
  });

  describe('login', () => {
    it('dovrebbe fare login e ritornare LoginResponse', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const req = {
        user: mockUser,
      };
      authService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(req, loginDto);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('refresh', () => {
    it('dovrebbe refreshare token e ritornare nuovo access token', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'refresh-token',
      };
      const expectedResponse = {
        accessToken: 'new-access-token',
      };
      authService.refreshToken.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.refresh(refreshTokenDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    });
  });

// Profile tests moved to ProfileController
// removed getProfile tests from AuthController spec
});
