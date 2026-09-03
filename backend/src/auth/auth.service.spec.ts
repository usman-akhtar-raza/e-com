import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: Role.CUSTOMER,
    avatar: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.email).toEqual('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should return null if password compare fails', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await service.validateUser('nonexistent@example.com', 'password123');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should sign a JWT token and return access_token and user', async () => {
      const userPayload = { id: 'user-uuid-1', email: 'test@example.com', role: Role.CUSTOMER };
      const result = await service.login(userPayload);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: userPayload.email,
        sub: userPayload.id,
        role: userPayload.role,
      });
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        user: userPayload,
      });
    });
  });

  describe('register', () => {
    it('should create a user and return login token', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 'new-uuid',
        ...dto,
        role: Role.CUSTOMER,
      });

      const result = await service.register(dto);
      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result.access_token).toEqual('mocked-jwt-token');
    });
  });
});
