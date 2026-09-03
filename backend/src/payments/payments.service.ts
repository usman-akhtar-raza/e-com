import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async processPayment(orderId: string, amount: number, paymentMethod = 'MOCK'): Promise<{ success: boolean; transactionId: string; order: Order }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    order.paymentStatus = PaymentStatus.PAID;
    order.paymentMethod = paymentMethod;
    if (order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PROCESSING;
    }

    const savedOrder = await this.orderRepository.save(order);

    return {
      success: true,
      transactionId,
      order: savedOrder,
    };
  }

  async refundPayment(orderId: string): Promise<{ success: boolean; order: Order }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Order is not in paid status');
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    const savedOrder = await this.orderRepository.save(order);

    return {
      success: true,
      order: savedOrder,
    };
  }
}
