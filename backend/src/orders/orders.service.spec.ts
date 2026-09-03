import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Partial<Repository<Order>>>;
  let orderItemRepo: jest.Mocked<Partial<Repository<OrderItem>>>;
  let cartService: jest.Mocked<Partial<CartService>>;
  let productsService: jest.Mocked<Partial<ProductsService>>;
  let inventoryService: jest.Mocked<Partial<InventoryService>>;
  let couponsService: jest.Mocked<Partial<CouponsService>>;
  let dataSource: jest.Mocked<Partial<DataSource>>;

  const mockOrder: Order = {
    id: 'order-uuid-1',
    orderNumber: 'ORD-12345',
    userId: 'user-uuid-1',
    user: {} as any,
    items: [
      {
        id: 'item-uuid-1',
        orderId: 'order-uuid-1',
        order: {} as any,
        productId: 'prod-uuid-1',
        product: {} as any,
        productName: 'Smartphone X',
        quantity: 2,
        unitPrice: 999.99,
        totalPrice: 1999.98,
        price: 999.99,
      },
    ],
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: 'MOCK',
    subtotal: 1999.98,
    discountAmount: 0,
    taxAmount: 99.99,
    shippingAmount: 0,
    totalAmount: 2099.97,
    shippingAddress: { street: '123 Main St' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    orderRepo = {
      find: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      findAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
      create: jest.fn().mockImplementation(dto => ({ id: 'order-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(o => Promise.resolve(o)),
    };

    orderItemRepo = {
      create: jest.fn().mockImplementation(dto => ({ id: 'item-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(i => Promise.resolve(i)),
    };

    cartService = {
      getCart: jest.fn().mockResolvedValue({
        id: 'cart-1',
        userId: 'user-uuid-1',
        items: [
          { productId: 'prod-uuid-1', quantity: 2, product: { id: 'prod-uuid-1', price: 999.99 } },
        ],
      }),
      clearCart: jest.fn().mockResolvedValue(undefined),
    };

    productsService = {
      findOne: jest.fn().mockResolvedValue({ id: 'prod-uuid-1', name: 'Smartphone X', price: 999.99 }),
    };

    inventoryService = {
      decreaseStock: jest.fn().mockResolvedValue(undefined),
      increaseStock: jest.fn().mockResolvedValue(undefined),
    };

    couponsService = {
      validateCoupon: jest.fn(),
      recordUsage: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(cb => cb({
        getRepository: (entity: any) => {
          if (entity === Order) return orderRepo;
          if (entity === OrderItem) return orderItemRepo;
          return {};
        },
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepo },
        { provide: CartService, useValue: cartService },
        { provide: ProductsService, useValue: productsService },
        { provide: InventoryService, useValue: inventoryService },
        { provide: CouponsService, useValue: couponsService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromCart', () => {
    it('should create order from cart successfully', async () => {
      const dto = { shippingAddress: { street: '123 Main St' } };
      const order = await service.createFromCart('user-uuid-1', dto);
      expect(order).toBeDefined();
      expect(inventoryService.decreaseStock).toHaveBeenCalled();
      expect(cartService.clearCart).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw BadRequestException if cart is empty', async () => {
      (cartService.getCart as jest.Mock).mockResolvedValue({ id: 'cart-1', userId: 'user-uuid-1', items: [] });
      await expect(service.createFromCart('user-uuid-1', { shippingAddress: {} })).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and restore stock when order status is PENDING', async () => {
      const order = await service.cancelOrder('order-uuid-1', 'user-uuid-1');
      expect(inventoryService.increaseStock).toHaveBeenCalledWith('prod-uuid-1', 2, undefined, expect.anything());
      expect(order.status).toEqual(OrderStatus.CANCELLED);
    });

    it('should throw ForbiddenException if user tries to cancel another user order', async () => {
      await expect(service.cancelOrder('order-uuid-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order status is SHIPPED', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, status: OrderStatus.SHIPPED });
      await expect(service.cancelOrder('order-uuid-1', 'user-uuid-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return order detail', async () => {
      const order = await service.findOne('order-uuid-1');
      expect(order).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
