import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database;

  onModuleInit() {
    //    this.db = new sqlite3.Database(':memory:');
    //    this.initializeTables();
    console.log(process.cwd(), 'DİR');
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    this.db = new sqlite3.Database(dbPath);

    this.initializeTables();
  }

  onModuleDestroy() {
    this.db.close();
  }

  private initializeTables() {
    const product_table_query = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL
      );
    `;

    const user_table_query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const order_table_query = `
       CREATE TABLE IF NOT EXISTS orders (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         total REAL NOT NULL,
         order_status TEXT NOT NULL DEFAULT 'pending', 
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    const order_items_table_query = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );
    `;

    const cart_table_query = `
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );
    `;

    this.db.run(product_table_query);
    this.db.run(user_table_query);
    this.db.run(order_table_query);
    this.db.run(order_items_table_query);
    this.db.run(cart_table_query);
  }

  // Runs the query but not return anything
  run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  // Runs the query but returns just one row
  get(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  // Runs the query but returns all
  all(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}
