import { Injectable } from '@nestjs/common';
import { Cart } from './cart.entity';
import { DatabaseService } from '../database/database.service';
@Injectable()
export class CartRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async exist(id: number): Promise<boolean> {
    const query = 'SELECT 1 FROM cart WHERE id = ?';
    const values = [id];
    const result = this.dbService.get(query, values);
    return result;
  }

  async findAll(user_id: number): Promise<Cart[]> {
    const query = 'SELECT * FROM carts WHERE user_id = ?';
    const values = [user_id];
    return this.dbService.all(query, values);
  }

  async findOne(user_id: number, product_id: number): Promise<Cart> {
    const query = 'SELECT * FROM carts WHERE user_id = ? AND product_id = ?';
    const values = [user_id, product_id];
    return this.dbService.get(query, values);
  }

  async create(cart: Omit<Cart, 'id'>): Promise<Cart> {
    const query = `
      INSERT INTO carts (user_id, product_id, quantity, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [cart.user_id, cart.product_id, cart.quantity];
    return this.dbService.get(query, values);
  }

  async update(cart: Cart): Promise<Cart> {
    const query = `
      UPDATE carts
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND product_id = ?
      RETURNING *;
    `;
    const values = [cart.quantity, cart.user_id, cart.product_id];
    return this.dbService.get(query, values);
  }

  async delete(user_id: number, product_id: number): Promise<void> {
    const query = 'DELETE FROM carts WHERE user_id = ? AND product_id = ?';
    const values = [user_id, product_id];
    await this.dbService.run(query, values);
  }

  async clear(user_id: number): Promise<void> {
    const query = 'DELETE FROM carts WHERE user_id = ?';
    const values = [user_id];
    await this.dbService.run(query, values);
  }
}
