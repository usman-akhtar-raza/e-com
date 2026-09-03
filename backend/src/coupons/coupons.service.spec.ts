import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { DiscountType } from '../common/enums/discount-type.enum';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('CouponsService', () => {
  let service: CouponsService;
  let couponRepo: jest.Mocked<Partial<Repository<Coupon>>>;
  let usageRepo: jest.Mocked<Partial<Repository<CouponUsage>>>;

  const mockCoupon: Coupon = {
    id: 'coupon-uuid-1',
    code: 'SAVE10',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    startDate: undefined,
    expirationDate: undefined,
    usageLimit: 100,
    userUsageLimit: 2,
    usedCount: 0,
    isActive: true,
    usages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    couponRepo = {
      find: jest.fn().mockResolvedValue([mockCoupon]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(dto => ({ id: 'coupon-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(c => Promise.resolve(c)),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    usageRepo = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(dto => ({ id: 'usage-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(u => Promise.resolve(u)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getRepositoryToken(Coupon), useValue: couponRepo },
        { provide: getRepositoryToken(CouponUsage), useValue: usageRepo },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create coupon successfully with uppercase code', async () => {
      (couponRepo.findOne as jest.Mock).mockResolvedValue(null);
      const dto = { code: 'save10', discountValue: 10 };
      const coupon = await service.create(dto as any);
      expect(coupon.code).toEqual('SAVE10');
    });

    it('should throw ConflictException if coupon code exists', async () => {
      (couponRepo.findOne as jest.Mock).mockResolvedValue(mockCoupon);
      await expect(service.create({ code: 'SAVE10', discountValue: 10 } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateCoupon', () => {
    it('should validate and calculate percentage discount correctly', async () => {
      (couponRepo.findOne as jest.Mock).mockResolvedValue(mockCoupon);
      const result = await service.validateCoupon('user-uuid-1', { code: 'SAVE10', orderAmount: 100 });
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toEqual(10); // 10% of 100 = 10
    });

    it('should throw BadRequestException if order amount < minOrderAmount', async () => {
      (couponRepo.findOne as jest.Mock).mockResolvedValue(mockCoupon); // minOrderAmount is 50
      await expect(service.validateCoupon('user-uuid-1', { code: 'SAVE10', orderAmount: 30 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user usage limit exceeded', async () => {
      (couponRepo.findOne as jest.Mock).mockResolvedValue(mockCoupon);
      (usageRepo.count as jest.Mock).mockResolvedValue(2); // userUsageLimit is 2
      await expect(service.validateCoupon('user-uuid-1', { code: 'SAVE10', orderAmount: 100 })).rejects.toThrow(BadRequestException);
    });
  });
});
