import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Role } from '../common/enums/role.enum';

export interface DashboardKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export interface SalesAnalyticsPoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface TopProductPerformance {
  productId: string;
  productName: string;
  sku?: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

export interface LowStockAlertItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Inventory) private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
      .getRawOne();

    const totalRevenue = Number(parseFloat(revenueResult?.total || '0').toFixed(2));

    const totalOrders = await this.orderRepository.count();
    const totalProducts = await this.productRepository.count({ where: { isActive: true } });
    const totalCustomers = await this.userRepository.count({ where: { role: Role.CUSTOMER } });
    const pendingOrdersCount = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });

    const lowStockItems = await this.inventoryRepository
      .createQueryBuilder('inv')
      .where('(inv.quantity - inv.reservedQuantity) <= inv.lowStockThreshold')
      .getCount();

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount: lowStockItems,
      pendingOrdersCount,
    };
  }

  async getSalesAnalytics(days = 30): Promise<SalesAnalyticsPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rawData = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt >= :startDate', { startDate })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return rawData.map(row => ({
      date: row.date,
      revenue: Number(parseFloat(row.revenue || '0').toFixed(2)),
      ordersCount: parseInt(row.orders || '0', 10),
    }));
  }

  async getTopProducts(limit = 5): Promise<TopProductPerformance[]> {
    const rawData = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rawData.map(row => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantitySold: parseInt(row.totalQuantity || '0', 10),
      totalRevenueGenerated: Number(parseFloat(row.totalRevenue || '0').toFixed(2)),
    }));
  }

  async getLowStockInventory(): Promise<LowStockAlertItem[]> {
    const inventoryItems = await this.inventoryRepository.find();
    const products = await this.productRepository.find({ relations: { variants: true } });
    const productMap = new Map(products.map(p => [p.id, p]));

    const alerts: LowStockAlertItem[] = [];

    for (const item of inventoryItems) {
      const available = item.quantity - item.reservedQuantity;
      if (available <= item.lowStockThreshold) {
        const product = productMap.get(item.productId);
        let variantName: string | undefined = undefined;
        if (item.variantId && product?.variants) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) variantName = variant.name;
        }

        alerts.push({
          id: item.id,
          productId: item.productId,
          productName: product ? product.name : 'Unknown Product',
          variantId: item.variantId,
          variantName,
          sku: item.sku,
          quantity: item.quantity,
          reservedQuantity: item.reservedQuantity,
          availableQuantity: available,
          lowStockThreshold: item.lowStockThreshold,
        });
      }
    }

    return alerts;
  }
}
