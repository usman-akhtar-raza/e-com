import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { DiscountType } from '../common/enums/discount-type.enum';

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon;
  discountAmount: number;
  message?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly usageRepository: Repository<CouponUsage>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const code = createCouponDto.code.toUpperCase().trim();
    const existing = await this.couponRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Coupon code ${code} already exists`);
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      code,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await this.couponRepository.findOne({ where: { code: uppercaseCode } });
    if (!coupon) {
      throw new NotFoundException(`Coupon code '${uppercaseCode}' not found`);
    }
    return coupon;
  }

  async validateCoupon(userId: string, validateCouponDto: ValidateCouponDto): Promise<CouponValidationResult> {
    const coupon = await this.findByCode(validateCouponDto.code);

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is currently inactive');
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }

    if (coupon.expirationDate && new Date(coupon.expirationDate) < now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.minOrderAmount && validateCouponDto.orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount of $${coupon.minOrderAmount} required for this coupon`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon overall usage limit has been reached');
    }

    // Check user usage limit
    const userUsages = await this.usageRepository.count({
      where: { couponId: coupon.id, userId },
    });

    if (userUsages >= coupon.userUsageLimit) {
      throw new BadRequestException('You have already reached the maximum usage limit for this coupon');
    }

    const discountAmount = this.calculateDiscount(coupon, validateCouponDto.orderAmount);

    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon applied successfully',
    };
  }

  calculateDiscount(coupon: Coupon, orderAmount: number): number {
    let discount = 0;
    const value = Number(coupon.discountValue);

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = (orderAmount * value) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === DiscountType.FIXED) {
      discount = Math.min(value, orderAmount);
    }

    return Number(discount.toFixed(2));
  }

  async recordUsage(couponId: string, userId: string, orderId?: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Coupon) : this.couponRepository;
    const usageRepo = manager ? manager.getRepository(CouponUsage) : this.usageRepository;

    const coupon = await repo.findOne({ where: { id: couponId } });
    if (coupon) {
      coupon.usedCount += 1;
      await repo.save(coupon);

      const usage = usageRepo.create({
        couponId,
        userId,
        orderId,
      });
      await usageRepo.save(usage);
    }
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    if (updateCouponDto.code) {
      updateCouponDto.code = updateCouponDto.code.toUpperCase().trim();
    }
    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }
}
