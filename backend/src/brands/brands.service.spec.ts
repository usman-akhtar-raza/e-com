import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from './brands.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<Partial<Repository<Brand>>>;

  const mockBrand: Brand = {
    id: 'brand-uuid-1',
    name: 'Apple',
    slug: 'apple',
    description: 'Tech company',
    logo: undefined,
    isActive: true,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation(dto => ({ id: 'brand-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(brand => Promise.resolve({ id: 'brand-uuid-1', ...brand })),
      find: jest.fn().mockResolvedValue([mockBrand]),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: getRepositoryToken(Brand),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a brand successfully', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const dto = { name: 'Nike', slug: 'nike', description: 'Sports brand' };

      const brand = await service.create(dto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { slug: dto.slug } });
      expect(brand).toBeDefined();
      expect(brand.name).toEqual(dto.name);
    });

    it('should throw ConflictException if slug already exists', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockBrand);
      const dto = { name: 'Apple', slug: 'apple' };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of brands', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockBrand]);
    });
  });

  describe('findOne', () => {
    it('should return brand if found by ID', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockBrand);
      const brand = await service.findOne('brand-uuid-1');
      expect(brand).toEqual(mockBrand);
    });

    it('should throw NotFoundException if brand not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return brand if found by slug', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockBrand);
      const brand = await service.findBySlug('apple');
      expect(brand).toEqual(mockBrand);
    });

    it('should throw NotFoundException if slug not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove brand if exists', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockBrand);
      await service.remove('brand-uuid-1');
      expect(repository.remove).toHaveBeenCalledWith(mockBrand);
    });
  });
});
