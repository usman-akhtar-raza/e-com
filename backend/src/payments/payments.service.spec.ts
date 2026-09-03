import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let orderRepo: jest.Mocked<Partial<Repository<Order>>>;

  const mockOrder: Order = {
    id: 'order-uuid-1',
    orderNumber: 'ORD-12345',
    userId: 'user-uuid-1',
    user: {} as any,
    items: [],
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: 'MOCK',
    subtotal: 100,
    discountAmount: 0,
    taxAmount: 5,
    shippingAmount: 0,
    totalAmount: 105,
    shippingAddress: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn().mockResolvedValue({ ...mockOrder }),
      save: jest.fn().mockImplementation(o => Promise.resolve(o)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayment', () => {
    it('should process payment and update status to PAID', async () => {
      const res = await service.processPayment('order-uuid-1', 105);
      expect(res.success).toBe(true);
      expect(res.order.paymentStatus).toEqual(PaymentStatus.PAID);
      expect(res.order.status).toEqual(OrderStatus.PROCESSING);
    });

    it('should throw BadRequestException if order is already paid', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, paymentStatus: PaymentStatus.PAID });
      await expect(service.processPayment('order-uuid-1', 105)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundPayment', () => {
    it('should refund payment if order is paid', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, paymentStatus: PaymentStatus.PAID });
      const res = await service.refundPayment('order-uuid-1');
      expect(res.success).toBe(true);
      expect(res.order.paymentStatus).toEqual(PaymentStatus.REFUNDED);
    });

    it('should throw BadRequestException if order is not paid', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, paymentStatus: PaymentStatus.PENDING });
      await expect(service.refundPayment('order-uuid-1')).rejects.toThrow(BadRequestException);
    });
  });
});
