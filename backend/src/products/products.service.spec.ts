import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductStatus } from '../common/enums/product-status.enum';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: jest.Mocked<Partial<Repository<Product>>>;
  let variantRepo: jest.Mocked<Partial<Repository<ProductVariant>>>;
  let imageRepo: jest.Mocked<Partial<Repository<ProductImage>>>;

  const mockProduct: Product = {
    id: 'prod-uuid-1',
    name: 'Smartphone X',
    slug: 'smartphone-x',
    description: 'Latest smartphone',
    shortDescription: 'OLED smartphone',
    price: 999.99,
    compareAtPrice: 1099.99,
    costPrice: 700.00,
    sku: 'SPX-001',
    stock: 50,
    status: ProductStatus.ACTIVE,
    images: ['https://example.com/spx.jpg'],
    categoryId: 'cat-uuid-1',
    brandId: 'brand-uuid-1',
    category: { id: 'cat-uuid-1', name: 'Electronics', slug: 'electronics', products: [], children: [], createdAt: new Date(), updatedAt: new Date(), isActive: true },
    brand: undefined,
    variants: [],
    productImages: [],
    reviews: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const queryBuilder: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
    };

    productRepo = {
      create: jest.fn().mockImplementation(dto => ({ id: 'prod-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(prod => Promise.resolve({ id: 'prod-uuid-1', ...prod })),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    variantRepo = {
      create: jest.fn().mockImplementation(dto => ({ id: 'var-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(v => Promise.resolve({ id: 'var-uuid-1', ...v })),
    };

    imageRepo = {
      create: jest.fn().mockImplementation(dto => ({ id: 'img-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(img => Promise.resolve({ id: 'img-uuid-1', ...img })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: variantRepo },
        { provide: getRepositoryToken(ProductImage), useValue: imageRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create product successfully', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(null);
      const dto = {
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'Latest phone',
        price: 999.99,
        categoryId: 'cat-uuid-1',
      };

      (productRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProduct);

      const result = await service.create(dto);
      expect(productRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException if slug exists', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);
      const dto = {
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'Latest phone',
        price: 999.99,
        categoryId: 'cat-uuid-1',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated result with search and filters', async () => {
      const result = await service.findAll({ search: 'smartphone', page: 1, limit: 10 });
      expect(result.data).toEqual([mockProduct]);
      expect(result.total).toEqual(1);
      expect(result.totalPages).toEqual(1);
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);
      const result = await service.findBySlug('smartphone-x');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if slug not found', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findBySlug('unknown-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addVariant', () => {
    it('should add variant to product', async () => {
      (productRepo.findOne as jest.Mock).mockResolvedValue(mockProduct);
      const variantDto = { sku: 'SPX-RED-64', name: '64GB / Red', price: 999.99 };

      const result = await service.addVariant('prod-uuid-1', variantDto);
      expect(variantRepo.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
