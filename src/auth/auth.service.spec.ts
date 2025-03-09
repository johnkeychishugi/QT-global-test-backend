import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Partial<User> as User;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(() => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword123'));
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
    });

    it('should register a new user and return tokens', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should login a user and return tokens', async () => {
      const loginDto = {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const loginDto = {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const loginDto = {
        emailOrUsername: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should refresh tokens', async () => {
      const userId = '1';
      const refreshToken = 'valid-refresh-token';

      const result = await service.refreshTokens(userId, refreshToken);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const userId = '1';
      const refreshToken = 'valid-refresh-token';

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      const userId = '1';
      const refreshToken = 'invalid-refresh-token';

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 