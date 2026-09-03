import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: jest.Mocked<Partial<Repository<Inventory>>>;
  let dataSource: jest.Mocked<Partial<DataSource>>;

  const mockInventory: Inventory = {
    id: 'inv-uuid-1',
    productId: 'prod-uuid-1',
    variantId: undefined,
    sku: 'SPX-001',
    quantity: 50,
    reservedQuantity: 5,
    lowStockThreshold: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation(dto => ({ id: 'inv-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(item => Promise.resolve({ id: 'inv-uuid-1', ...item })),
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(cb => cb({
        getRepository: () => repository,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: repository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByProduct', () => {
    it('should return inventory for product', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockInventory);
      const res = await service.findByProduct('prod-uuid-1');
      expect(res).toEqual(mockInventory);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findByProduct('invalid-prod')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability', () => {
    it('should return true if available quantity >= requested', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockInventory); // quantity 50, reserved 5 -> 45 available
      const available = await service.checkAvailability('prod-uuid-1', 10);
      expect(available).toBe(true);
    });

    it('should return false if requested > available stock', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockInventory);
      const available = await service.checkAvailability('prod-uuid-1', 50);
      expect(available).toBe(false);
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock successfully when available', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue({ ...mockInventory });
      await service.reserveStock('prod-uuid-1', 10);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue({ ...mockInventory, quantity: 5, reservedQuantity: 5 });
      await expect(service.reserveStock('prod-uuid-1', 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock successfully', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue({ ...mockInventory });
      await service.decreaseStock('prod-uuid-1', 10);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if stock would become negative', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue({ ...mockInventory, quantity: 5 });
      await expect(service.decreaseStock('prod-uuid-1', 10)).rejects.toThrow(BadRequestException);
    });
  });
});
