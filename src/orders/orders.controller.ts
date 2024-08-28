import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Post()
  async create(@Body('order') order: Partial<Order>): Promise<Order> {
    return this.ordersService.create(order);
  }

  //  @Delete(':id')
  //  async delete(@Param('id') id: number): Promise<{ message: string }> {
  //    return this.ordersService.delete(id);
  //  }
}
