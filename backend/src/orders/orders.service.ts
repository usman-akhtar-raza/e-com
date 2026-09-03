import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    private readonly couponsService: CouponsService,
    private readonly dataSource: DataSource,
  ) {}

  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${random}`;
  }

  async createFromCart(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      let subtotal = 0;
      const orderItemsToCreate: Partial<OrderItem>[] = [];

      // Validate stock & calculate subtotal
      for (const item of cart.items) {
        const product = await this.productsService.findOne(item.productId);
        let unitPrice = Number(product.price);
        let variantName: string | undefined = undefined;

        if (item.variantId) {
          const variant = product.variants?.find(v => v.id === item.variantId);
          if (!variant) {
            throw new NotFoundException(`Variant ${item.variantId} not found`);
          }
          variantName = variant.name;
          if (variant.price !== undefined && variant.price !== null) {
            unitPrice = Number(variant.price);
          }
        }

        // Deduct stock transactionally
        await this.inventoryService.decreaseStock(item.productId, item.quantity, item.variantId, manager);

        const totalPrice = Number((unitPrice * item.quantity).toFixed(2));
        subtotal += totalPrice;

        orderItemsToCreate.push({
          productId: product.id,
          variantId: item.variantId,
          productName: product.name,
          variantName,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          price: unitPrice,
        });
      }

      subtotal = Number(subtotal.toFixed(2));

      // Handle Coupon
      let discountAmount = 0;
      let couponCodeUsed: string | undefined = undefined;

      if (createOrderDto.couponCode) {
        const couponResult = await this.couponsService.validateCoupon(userId, {
          code: createOrderDto.couponCode,
          orderAmount: subtotal,
        });

        discountAmount = couponResult.discountAmount;
        couponCodeUsed = couponResult.coupon.code;

        // Record coupon usage
        await this.couponsService.recordUsage(couponResult.coupon.id, userId, undefined, manager);
      }

      // Calculate Tax & Shipping
      const shippingAmount = subtotal >= 100 ? 0 : 10;
      const taxAmount = Number(((subtotal - discountAmount) * 0.05).toFixed(2)); // 5% tax
      const totalAmount = Number((subtotal - discountAmount + shippingAmount + taxAmount).toFixed(2));

      const orderNumber = this.generateOrderNumber();

      const order = orderRepo.create({
        orderNumber,
        userId,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
        subtotal,
        discountAmount,
        taxAmount,
        shippingAmount,
        totalAmount,
        couponCode: couponCodeUsed,
        paymentMethod: createOrderDto.paymentMethod || 'MOCK',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await orderRepo.save(order);

      for (const itemData of orderItemsToCreate) {
        const orderItem = orderItemRepo.create({
          ...itemData,
          orderId: savedOrder.id,
        });
        await orderItemRepo.save(orderItem);
      }

      // Clear user cart
      await this.cartService.clearCart(userId);

      return this.findOne(savedOrder.id, manager);
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, status?: OrderStatus): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true, items: { product: true, variant: true } },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { items: { product: true, variant: true } },
    });
  }

  async findOne(id: string, manager?: EntityManager): Promise<Order> {
    const repo = manager ? manager.getRepository(Order) : this.orderRepository;
    const order = await repo.findOne({
      where: { id },
      relations: { user: true, items: { product: true, variant: true } },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async cancelOrder(id: string, userId?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const order = await this.findOne(id, manager);

      if (userId && order.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own orders');
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
        throw new BadRequestException(`Order cannot be cancelled in status ${order.status}`);
      }

      // Restore inventory stock for each order item
      for (const item of order.items) {
        await this.inventoryService.increaseStock(item.productId, item.quantity, item.variantId, manager);
      }

      order.status = OrderStatus.CANCELLED;
      const orderRepo = manager.getRepository(Order);
      return orderRepo.save(order);
    });
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
      return this.cancelOrder(id);
    }

    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}
