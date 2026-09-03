import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async findByProduct(productId: string, variantId?: string): Promise<Inventory> {
    const where: any = { productId };
    if (variantId) {
      where.variantId = variantId;
    }
    const item = await this.inventoryRepository.findOne({ where });
    if (!item) {
      throw new NotFoundException(`Inventory record for product ${productId} not found`);
    }
    return item;
  }

  async updateStock(productId: string, updateStockDto: UpdateStockDto, variantId?: string): Promise<Inventory> {
    const where: any = { productId };
    if (variantId) {
      where.variantId = variantId;
    }

    let item = await this.inventoryRepository.findOne({ where });
    if (!item) {
      item = this.inventoryRepository.create({
        productId,
        variantId,
        sku: updateStockDto.sku || `SKU-${productId.substring(0, 8)}`,
        quantity: updateStockDto.quantity,
        lowStockThreshold: updateStockDto.lowStockThreshold || 5,
      });
    } else {
      item.quantity = updateStockDto.quantity;
      if (updateStockDto.lowStockThreshold !== undefined) {
        item.lowStockThreshold = updateStockDto.lowStockThreshold;
      }
      if (updateStockDto.sku) {
        item.sku = updateStockDto.sku;
      }
    }

    if (item.quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    return this.inventoryRepository.save(item);
  }

  async checkAvailability(productId: string, quantity: number, variantId?: string, manager?: EntityManager): Promise<boolean> {
    const repo = manager ? manager.getRepository(Inventory) : this.inventoryRepository;
    const where: any = { productId };
    if (variantId) {
      where.variantId = variantId;
    }

    const item = await repo.findOne({ where });
    if (!item) {
      return false;
    }
    const available = item.quantity - item.reservedQuantity;
    return available >= quantity;
  }

  async reserveStock(productId: string, quantity: number, variantId?: string, manager?: EntityManager): Promise<void> {
    const execute = async (em: EntityManager) => {
      const repo = em.getRepository(Inventory);
      const where: any = { productId };
      if (variantId) {
        where.variantId = variantId;
      }

      const item = await repo.findOne({
        where,
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item for product ${productId} not found`);
      }

      const available = item.quantity - item.reservedQuantity;
      if (available < quantity) {
        throw new BadRequestException(`Insufficient available stock. Requested: ${quantity}, Available: ${available}`);
      }

      item.reservedQuantity += quantity;
      await repo.save(item);
    };

    if (manager) {
      await execute(manager);
    } else {
      await this.dataSource.transaction(execute);
    }
  }

  async releaseStock(productId: string, quantity: number, variantId?: string, manager?: EntityManager): Promise<void> {
    const execute = async (em: EntityManager) => {
      const repo = em.getRepository(Inventory);
      const where: any = { productId };
      if (variantId) {
        where.variantId = variantId;
      }

      const item = await repo.findOne({
        where,
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item for product ${productId} not found`);
      }

      item.reservedQuantity = Math.max(0, item.reservedQuantity - quantity);
      await repo.save(item);
    };

    if (manager) {
      await execute(manager);
    } else {
      await this.dataSource.transaction(execute);
    }
  }

  async decreaseStock(productId: string, quantity: number, variantId?: string, manager?: EntityManager): Promise<void> {
    const execute = async (em: EntityManager) => {
      const repo = em.getRepository(Inventory);
      const where: any = { productId };
      if (variantId) {
        where.variantId = variantId;
      }

      const item = await repo.findOne({
        where,
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item for product ${productId} not found`);
      }

      if (item.quantity < quantity) {
        throw new BadRequestException(`Cannot decrease stock below 0. Current stock: ${item.quantity}, Requested: ${quantity}`);
      }

      item.quantity -= quantity;
      item.reservedQuantity = Math.max(0, item.reservedQuantity - quantity);
      await repo.save(item);
    };

    if (manager) {
      await execute(manager);
    } else {
      await this.dataSource.transaction(execute);
    }
  }

  async increaseStock(productId: string, quantity: number, variantId?: string, manager?: EntityManager): Promise<void> {
    const execute = async (em: EntityManager) => {
      const repo = em.getRepository(Inventory);
      const where: any = { productId };
      if (variantId) {
        where.variantId = variantId;
      }

      let item = await repo.findOne({ where });
      if (!item) {
        item = repo.create({
          productId,
          variantId,
          sku: `SKU-${productId.substring(0, 8)}`,
          quantity,
          reservedQuantity: 0,
          lowStockThreshold: 5,
        });
      } else {
        item.quantity += quantity;
      }

      await repo.save(item);
    };

    if (manager) {
      await execute(manager);
    } else {
      await this.dataSource.transaction(execute);
    }
  }
}
