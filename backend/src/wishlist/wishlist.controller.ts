import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  getWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  checkWishlistStatus(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.checkWishlistStatus(user.id, productId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  addItem(@CurrentUser() user: User, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.addItem(user.id, addToWishlistDto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeItem(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(user.id, productId);
  }
}
