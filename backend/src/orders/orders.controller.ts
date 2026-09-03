import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from current user cart' })
  createFromCart(@CurrentUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createFromCart(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders (User: own orders, Admin: all orders)' })
  findAll(
    @CurrentUser() user: User,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: OrderStatus,
  ) {
    if (user.role === Role.ADMIN) {
      return this.ordersService.findAll(paginationQuery, status);
    }
    return this.ordersService.findUserOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail by id' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (user.role !== Role.ADMIN && order.userId !== user.id) {
      throw new Error('Unauthorized access to order');
    }
    return order;
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order and restore inventory (Customer)' })
  cancelOrder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin)' })
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
