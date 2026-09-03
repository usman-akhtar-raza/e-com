import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process payment (Mock)' })
  process(@Body() body: { orderId: string; amount: number; paymentMethod?: string }) {
    return this.paymentsService.processPayment(body.orderId, body.amount, body.paymentMethod);
  }

  @Post('refund/:orderId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Refund payment (Admin)' })
  refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refundPayment(orderId);
  }
}
