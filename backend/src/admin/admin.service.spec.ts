import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepo: jest.Mocked<Partial<Repository<Order>>>;
  let productRepo: jest.Mocked<Partial<Repository<Product>>>;
  let userRepo: jest.Mocked<Partial<Repository<User>>>;
  let inventoryRepo: jest.Mocked<Partial<Repository<Inventory>>>;

  beforeEach(async () => {
    orderRepo = {
      count: jest.fn().mockResolvedValue(10),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '1500.50' }),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2026-09-01', revenue: '500.00', orders: '3' },
        ]),
      }),
    };

    productRepo = {
      count: jest.fn().mockResolvedValue(25),
      find: jest.fn().mockResolvedValue([]),
    };

    userRepo = {
      count: jest.fn().mockResolvedValue(50),
    };

    inventoryRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'inv-1',
          productId: 'prod-1',
          sku: 'SKU-001',
          quantity: 2,
          reservedQuantity: 0,
          lowStockThreshold: 5,
        },
      ]),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardKPIs', () => {
    it('should return overview KPI metrics', async () => {
      const kpis = await service.getDashboardKPIs();
      expect(kpis.totalRevenue).toEqual(1500.50);
      expect(kpis.totalOrders).toEqual(10);
      expect(kpis.totalProducts).toEqual(25);
      expect(kpis.totalCustomers).toEqual(50);
      expect(kpis.lowStockCount).toEqual(1);
    });
  });

  describe('getSalesAnalytics', () => {
    it('should return sales trend data points', async () => {
      const sales = await service.getSalesAnalytics(30);
      expect(sales).toHaveLength(1);
      expect(sales[0].revenue).toEqual(500.00);
      expect(sales[0].ordersCount).toEqual(3);
    });
  });

  describe('getLowStockInventory', () => {
    it('should return inventory items below threshold', async () => {
      const alerts = await service.getLowStockInventory();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].sku).toEqual('SKU-001');
      expect(alerts[0].availableQuantity).toEqual(2);
    });
  });
});
