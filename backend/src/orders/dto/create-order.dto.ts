import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Shipping address object or ID' })
  @IsNotEmpty()
  shippingAddress: any;

  @ApiPropertyOptional({ description: 'Billing address object or ID' })
  @IsOptional()
  billingAddress?: any;

  @ApiPropertyOptional({ description: 'Optional coupon code for discount' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Payment method, e.g. MOCK, STRIPE, COD', default: 'MOCK' })
  @IsOptional()
  @IsString()
  paymentMethod?: string = 'MOCK';
}
