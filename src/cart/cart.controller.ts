import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':user_id')
  findAll(@Param('user_id') user_id: number): Promise<Cart[]> {
    return this.cartService.findAll(user_id);
  }

  @Post('add')
  addToCart(
    @Body('user_id') user_id: number,
    @Body('product_id') product_id: number,
    @Body('quantity') quantity: number,
  ): Promise<Cart> {
    return this.cartService.addToCart(user_id, product_id, quantity);
  }

  @Delete('remove')
  removeFromCart(
    @Body('user_id') user_id: number,
    @Body('product_id') product_id: number,
  ): Promise<void> {
    return this.cartService.removeFromCart(user_id, product_id);
  }

  @Delete('clear/:user_id')
  clearCart(@Param('user_id') user_id: number): Promise<void> {
    return this.cartService.clearCart(user_id);
  }
}
