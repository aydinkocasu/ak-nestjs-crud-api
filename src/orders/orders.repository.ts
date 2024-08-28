import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Order, OrderItem } from './order.entity';

@Injectable()
export class OrdersRepository {
  constructor(private readonly dbService: DatabaseService) { }

  async findAll(): Promise<Order[]> {
    const query = 'SELECT * FROM orders';
    const orders = await this.dbService.all(query);

    for (const order of orders) {
      order.order_items = await this.getOrderItems(order.id);
    }

    return orders;
  }

  async findOne(id: number): Promise<Order> {
    const query = 'SELECT * FROM orders WHERE id = ?';
    const values = [id];
    const order = await this.dbService.get(query, values);

    if (order) {
      order.order_items = await this.getOrderItems(order.id);
    }

    return order;
  }

  async create(order: Partial<Order>): Promise<Order> {
    const insertorderQuery =
      'INSERT INTO orders (user_id, total) VALUES (?,?) RETURNING *;';
    const values = [order.user_id, order.total];
    const createdOrder = await this.dbService.get(insertorderQuery, values);

    //Create Items for ordered
    for (const item of order.order_items) {
      await this._createOrderItem(createdOrder.id, item);
    }

    // Return Item
    return await this.findOne(createdOrder.id);
  }

  async delete(id: number): Promise<void> {
    await this.dbService.run('DELETE FROM order_items WHERE order_id = ?', [
      id,
    ]);
    await this.dbService.run('DELETE FROM orders WHERE id = ?', [id]);
  }

  private async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const query = 'SELECT * FROM order_items WHERE order_id = ?';
    return this.dbService.all(query, [orderId]);
  }

  private async _createOrderItem(
    orderId: number,
    item: OrderItem,
  ): Promise<void> {
    const query =
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
    const values = [orderId, item.product_id, item.quantity, item.price];
    await this.dbService.run(query, values);
  }
}
