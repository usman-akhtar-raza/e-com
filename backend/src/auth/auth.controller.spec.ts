import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: Role.CUSTOMER,
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      const expectedResult = { access_token: 'jwt-token', user: mockUser };
      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should validate and login user when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { access_token: 'jwt-token', user: mockUser };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException when validateUser returns null', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the current authenticated user', () => {
      const result = controller.getProfile(mockUser as any);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should return a logout success message', () => {
      const result = controller.logout();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
