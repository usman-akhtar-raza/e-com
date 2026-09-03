import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin-analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Admin Dashboard KPI metrics' })
  getDashboardKPIs() {
    return this.adminService.getDashboardKPIs();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales revenue analytics over time' })
  getSalesAnalytics(@Query('days') days?: number) {
    return this.adminService.getSalesAnalytics(days ? Number(days) : 30);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top performing products' })
  getTopProducts(@Query('limit') limit?: number) {
    return this.adminService.getTopProducts(limit ? Number(limit) : 5);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get inventory low stock alerts' })
  getLowStockInventory() {
    return this.adminService.getLowStockInventory();
  }
}
