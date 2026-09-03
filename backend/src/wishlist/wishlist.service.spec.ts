import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { ProductsService } from '../products/products.service';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;
  let repo: jest.Mocked<Partial<Repository<WishlistItem>>>;
  let productsService: jest.Mocked<Partial<ProductsService>>;

  const mockWishlistItem: WishlistItem = {
    id: 'wish-uuid-1',
    userId: 'user-uuid-1',
    user: {} as any,
    productId: 'prod-uuid-1',
    product: {} as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([mockWishlistItem]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(dto => ({ id: 'wish-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(item => Promise.resolve(item)),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    productsService = {
      findOne: jest.fn().mockResolvedValue({ id: 'prod-uuid-1' } as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: getRepositoryToken(WishlistItem), useValue: repo },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWishlist', () => {
    it('should return array of wishlist items', async () => {
      const result = await service.getWishlist('user-uuid-1');
      expect(result).toEqual([mockWishlistItem]);
    });
  });

  describe('checkWishlistStatus', () => {
    it('should return true if product is in wishlist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockWishlistItem);
      const isWishlisted = await service.checkWishlistStatus('user-uuid-1', 'prod-uuid-1');
      expect(isWishlisted).toBe(true);
    });

    it('should return false if product is not in wishlist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const isWishlisted = await service.checkWishlistStatus('user-uuid-1', 'prod-uuid-2');
      expect(isWishlisted).toBe(false);
    });
  });

  describe('addItem', () => {
    it('should add product to wishlist successfully', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const item = await service.addItem('user-uuid-1', { productId: 'prod-uuid-1' });
      expect(item).toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if product is already in wishlist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockWishlistItem);
      await expect(service.addItem('user-uuid-1', { productId: 'prod-uuid-1' })).rejects.toThrow(ConflictException);
    });
  });

  describe('removeItem', () => {
    it('should remove product from wishlist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockWishlistItem);
      await service.removeItem('user-uuid-1', 'prod-uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(mockWishlistItem);
    });

    it('should throw NotFoundException if product is not in wishlist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.removeItem('user-uuid-1', 'invalid-prod')).rejects.toThrow(NotFoundException);
    });
  });
});
