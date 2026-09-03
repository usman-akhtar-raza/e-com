import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: { product: { category: true, brand: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async checkWishlistStatus(userId: string, productId: string): Promise<boolean> {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    return !!item;
  }

  async addItem(userId: string, addToWishlistDto: AddToWishlistDto): Promise<WishlistItem> {
    await this.productsService.findOne(addToWishlistDto.productId);

    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId: addToWishlistDto.productId },
    });

    if (existing) {
      throw new ConflictException('Product is already in your wishlist');
    }

    const item = this.wishlistRepository.create({
      userId,
      productId: addToWishlistDto.productId,
    });

    return this.wishlistRepository.save(item);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.wishlistRepository.remove(item);
  }
}
