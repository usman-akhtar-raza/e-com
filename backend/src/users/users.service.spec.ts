import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword123'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Partial<Repository<User>>>;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CUSTOMER,
    avatar: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation(dto => ({ id: 'user-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(user => Promise.resolve({ id: 'user-uuid-1', ...user })),
      findAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create a user successfully', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      const dto = { email: 'new@example.com', password: 'password123', firstName: 'Jane', lastName: 'Doe' };
      const user = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(user).toBeDefined();
      expect(user.email).toEqual(dto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const dto = { email: 'user@example.com', password: 'password123', firstName: 'John', lastName: 'Doe' };
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toEqual(1);
      expect(result.totalPages).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const user = await service.findOne('user-uuid-1');
      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const user = await service.findByEmail('user@example.com');
      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if email not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findByEmail('unknown@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove user if exists', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      await service.remove('user-uuid-1');
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });
  });
});
