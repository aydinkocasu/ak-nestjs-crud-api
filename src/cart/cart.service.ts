import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { Cart } from './cart.entity';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async findAll(user_id: number): Promise<Cart[]> {
    return this.cartRepository.findAll(user_id);
  }

  async addToCart(
    user_id: number,
    product_id: number,
    quantity: number,
  ): Promise<Cart> {
    const cart_item = await this.cartRepository.findOne(user_id, product_id);
    if (cart_item) {
      cart_item.quantity += quantity;
      return this.cartRepository.update(cart_item);
    } else {
      const new_cart_item: Omit<Cart, 'id'> = { user_id, product_id, quantity };
      return this.cartRepository.create(new_cart_item);
    }
  }

  async removeFromCart(user_id: number, product_id: number): Promise<void> {
    const cart_item = await this.cartRepository.findOne(user_id, product_id);
    if (!cart_item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.delete(user_id, product_id);
  }

  async clearCart(user_id: number): Promise<void> {
    await this.cartRepository.clear(user_id);
  }
}
