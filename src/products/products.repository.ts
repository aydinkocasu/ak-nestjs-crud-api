import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async exist(id: number): Promise<boolean> {
    const query = 'SELECT 1 FROM products WHERE id = ?';
    const values = [id];
    const result = this.dbService.get(query, values);
    return result;
  }
  async findAll(): Promise<Product[]> {
    const query = 'SELECT * FROM products';
    console.log(this.dbService.all(query));
    return this.dbService.all(query);
  }

  async findOne(id: number): Promise<Product> {
    const query = 'SELECT * FROM products WHERE id = ?';
    const values = [id];
    return this.dbService.get(query, values);
  }

  // TODO: NEED TO FILTER OUT ID WHEN WE RETURNING REQUEST
  async create(product: Product): Promise<Product> {
    const query =
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?) RETURNING *;';
    const values = [
      product.name,
      product.description,
      product.price,
      product.stock,
    ];
    return await this.dbService.get(query, values);
  }

  // TODO: NEED TO FILTER OUT ID WHEN WE RETURNING REQUEST
  async update(id: number, product: Product): Promise<Product> {
    const query =
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ? RETURNING *;';
    const values = [
      product.name,
      product.description,
      product.price,
      product.stock,
      id,
    ];
    return await this.dbService.get(query, values);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM products WHERE id = ?';
    const values = [id];
    await this.dbService.run(query, values);
  }
}
