import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

interface CustomRequest extends Request {
  user: { sub: string };
  cookies: { refresh_token: string };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn().mockResolvedValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }),
      login: jest.fn().mockResolvedValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return access token', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.register(registerDto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'test-access-token' });
    });
  });

  describe('login', () => {
    it('should login a user and return access token', async () => {
      const loginDto = {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'test-access-token' });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and return new access token', async () => {
      const req: CustomRequest = {
        user: { sub: 'user-id' },
        cookies: { refresh_token: 'test-refresh-token' },
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
      } as any;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(req, mockResponse);

      expect(authService.refreshTokens).toHaveBeenCalledWith('user-id', 'test-refresh-token');
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
}); 