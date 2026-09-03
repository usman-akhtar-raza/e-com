import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ 
      where: { userId },
      relations: { items: { product: true } }
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productsService.findOne(addToCartDto.productId);

    let item = cart.items?.find(i => i.productId === addToCartDto.productId);

    if (item) {
      item.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id,
        quantity: addToCartDto.quantity,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({ where: { id: itemId, cart: { userId } }, relations: { cart: true } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({ where: { id: itemId, cart: { userId } }, relations: { cart: true } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(item);

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}
