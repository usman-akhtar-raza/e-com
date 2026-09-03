import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: { product: true, variant: true } },
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

    let variantPrice: number | undefined = undefined;
    if (addToCartDto.variantId) {
      const variant = product.variants?.find(v => v.id === addToCartDto.variantId);
      if (!variant) {
        throw new NotFoundException(`Product variant ${addToCartDto.variantId} not found`);
      }
      variantPrice = variant.price !== undefined && variant.price !== null ? Number(variant.price) : Number(product.price);
    }

    const currentPrice = variantPrice !== undefined ? variantPrice : Number(product.price);

    let item = cart.items?.find(
      i => i.productId === addToCartDto.productId && i.variantId === (addToCartDto.variantId || null)
    );

    const newQuantity = (item ? item.quantity : 0) + addToCartDto.quantity;

    // Check inventory stock availability
    const isAvailable = await this.inventoryService.checkAvailability(
      addToCartDto.productId,
      newQuantity,
      addToCartDto.variantId,
    ).catch(() => product.stock >= newQuantity);

    if (!isAvailable) {
      throw new BadRequestException(`Cannot add item to cart. Requested quantity (${newQuantity}) exceeds available stock.`);
    }

    if (item) {
      item.quantity = newQuantity;
      item.priceSnapshot = currentPrice;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id,
        variantId: addToCartDto.variantId,
        quantity: addToCartDto.quantity,
        priceSnapshot: currentPrice,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { userId } },
      relations: { cart: true, product: true, variant: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Check inventory stock availability
    const isAvailable = await this.inventoryService.checkAvailability(
      item.productId,
      updateCartItemDto.quantity,
      item.variantId,
    ).catch(() => item.product ? item.product.stock >= updateCartItemDto.quantity : true);

    if (!isAvailable) {
      throw new BadRequestException(`Cannot update quantity. Requested quantity (${updateCartItemDto.quantity}) exceeds available stock.`);
    }

    item.quantity = updateCartItemDto.quantity;

    // Refresh price snapshot from current product/variant price
    if (item.variant && item.variant.price !== undefined && item.variant.price !== null) {
      item.priceSnapshot = Number(item.variant.price);
    } else if (item.product) {
      item.priceSnapshot = Number(item.product.price);
    }

    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { userId } },
      relations: { cart: true },
    });

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
    return cart.items.reduce((total, item) => {
      const price = item.priceSnapshot !== undefined && item.priceSnapshot !== null
        ? Number(item.priceSnapshot)
        : Number(item.product.price);
      return total + (price * item.quantity);
    }, 0);
  }
}
