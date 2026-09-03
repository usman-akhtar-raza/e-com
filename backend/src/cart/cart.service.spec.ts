import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: jest.Mocked<Partial<Repository<Cart>>>;
  let cartItemRepo: jest.Mocked<Partial<Repository<CartItem>>>;
  let productsService: jest.Mocked<Partial<ProductsService>>;
  let inventoryService: jest.Mocked<Partial<InventoryService>>;

  const mockProduct = {
    id: 'prod-uuid-1',
    name: 'Smartphone X',
    price: 999.99,
    stock: 50,
    variants: [],
  };

  const mockCart: Cart = {
    id: 'cart-uuid-1',
    userId: 'user-uuid-1',
    user: {} as any,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    cartRepo = {
      findOne: jest.fn().mockResolvedValue({ ...mockCart }),
      create: jest.fn().mockImplementation(dto => ({ id: 'cart-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(c => Promise.resolve(c)),
    };

    cartItemRepo = {
      create: jest.fn().mockImplementation(dto => ({ id: 'item-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(item => Promise.resolve(item)),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    productsService = {
      findOne: jest.fn().mockResolvedValue(mockProduct as any),
    };

    inventoryService = {
      checkAvailability: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(CartItem), useValue: cartItemRepo },
        { provide: ProductsService, useValue: productsService },
        { provide: InventoryService, useValue: inventoryService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return cart if exists', async () => {
      const cart = await service.getCart('user-uuid-1');
      expect(cart).toBeDefined();
      expect(cart.userId).toEqual('user-uuid-1');
    });

    it('should create cart if does not exist', async () => {
      (cartRepo.findOne as jest.Mock).mockResolvedValue(null);
      const cart = await service.getCart('new-user-id');
      expect(cartRepo.create).toHaveBeenCalledWith({ userId: 'new-user-id' });
    });
  });

  describe('addItem', () => {
    it('should add item to cart when inventory is available', async () => {
      const dto = { productId: 'prod-uuid-1', quantity: 2 };
      const cart = await service.addItem('user-uuid-1', dto);
      expect(cartItemRepo.save).toHaveBeenCalled();
      expect(cart).toBeDefined();
    });

    it('should throw BadRequestException when inventory stock is insufficient', async () => {
      (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(false);
      const dto = { productId: 'prod-uuid-1', quantity: 100 };
      await expect(service.addItem('user-uuid-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity successfully', async () => {
      const mockItem = {
        id: 'item-uuid-1',
        productId: 'prod-uuid-1',
        quantity: 1,
        cart: { userId: 'user-uuid-1' },
      };
      (cartItemRepo.findOne as jest.Mock).mockResolvedValue(mockItem);

      await service.updateItem('user-uuid-1', 'item-uuid-1', { quantity: 3 });
      expect(cartItemRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart item is not found', async () => {
      (cartItemRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.updateItem('user-uuid-1', 'invalid-id', { quantity: 2 })).rejects.toThrow(NotFoundException);
    });
  });
});
