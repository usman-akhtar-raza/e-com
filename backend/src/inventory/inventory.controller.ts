import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product inventory (Admin)' })
  findByProduct(
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.findByProduct(productId, variantId);
  }

  @Patch('product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock (Admin)' })
  updateStock(
    @Param('productId') productId: string,
    @Body() updateStockDto: UpdateStockDto,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.updateStock(productId, updateStockDto, variantId);
  }
}
