import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
    private productsService: ProductsService,
  ) {}

  async createFromCart(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount = await this.cartService.getCartTotal(userId);

    const order = this.orderRepository.create({
      userId,
      shippingAddress: createOrderDto.shippingAddress,
      totalAmount,
    });

    await this.orderRepository.save(order);

    for (const item of cart.items) {
      await this.productsService.updateStock(item.productId, -item.quantity);
      
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
      await this.orderItemRepository.save(orderItem);
    }

    await this.cartService.clearCart(userId);

    return this.findOne(order.id);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const [data, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true, items: { product: true } }
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { items: { product: true } }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}
