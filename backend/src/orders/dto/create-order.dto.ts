import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: { street: '123 Main St', city: 'NY', state: 'NY', zipCode: '10001', country: 'USA' }
  })
  @IsObject()
  @IsNotEmpty()
  shippingAddress: Record<string, any>;
}
