import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Cart (e2e)', () => {
  let app: INestApplication;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dbService = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Reset db before each test
    await dbService.run('DROP TABLE IF EXISTS carts');
    await dbService.run('DROP TABLE IF EXISTS users');
    await dbService.run('DROP TABLE IF EXISTS products');

    const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const productTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    );
  `;

    const cartTableQuery = `
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `;

    await dbService.run(userTableQuery);
    await dbService.run(productTableQuery);
    await dbService.run(cartTableQuery);
  });

  it('/cart/add (POST) - Add item to cart', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    await dbService.run(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [
        createProductDto.name,
        createProductDto.description,
        createProductDto.price,
        createProductDto.stock,
      ],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    const product = await dbService.get(
      'SELECT * FROM products WHERE name = ?',
      [createProductDto.name],
    );

    const addCartItemDto = {
      user_id: user.id,
      product_id: product.id,
      quantity: 2,
    };

    return request(app.getHttpServer())
      .post('/cart/add')
      .send(addCartItemDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.user_id).toEqual(addCartItemDto.user_id);
        expect(res.body.product_id).toEqual(addCartItemDto.product_id);
        expect(res.body.quantity).toEqual(addCartItemDto.quantity);
      });
  });

  it('/cart/:user_id (GET) - Get all items in user cart', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    await dbService.run(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [
        createProductDto.name,
        createProductDto.description,
        createProductDto.price,
        createProductDto.stock,
      ],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    const product = await dbService.get(
      'SELECT * FROM products WHERE name = ?',
      [createProductDto.name],
    );

    await dbService.run(
      'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user.id, product.id, 2],
    );

    return request(app.getHttpServer())
      .get(`/cart/${user.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_id).toEqual(user.id);
        expect(res.body[0].product_id).toEqual(product.id);
        expect(res.body[0].quantity).toEqual(2);
      });
  });

  it('/cart/remove (DELETE) - Remove item from cart', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    await dbService.run(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [
        createProductDto.name,
        createProductDto.description,
        createProductDto.price,
        createProductDto.stock,
      ],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    const product = await dbService.get(
      'SELECT * FROM products WHERE name = ?',
      [createProductDto.name],
    );

    await dbService.run(
      'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user.id, product.id, 2],
    );

    const removeCartItemDto = {
      user_id: user.id,
      product_id: product.id,
    };

    return request(app.getHttpServer())
      .delete('/cart/remove')
      .send(removeCartItemDto)
      .expect(200)
      .expect(async () => {
        const cartItem = await dbService.get(
          'SELECT * FROM carts WHERE user_id = ? AND product_id = ?',
          [user.id, product.id],
        );
        expect(cartItem).toBeUndefined();
      });
  });

  it('/cart/clear/:user_id (DELETE) - Clear user cart', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    const createProductDto1 = {
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 100,
      stock: 10,
    };

    const createProductDto2 = {
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 200,
      stock: 5,
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    await dbService.run(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [
        createProductDto1.name,
        createProductDto1.description,
        createProductDto1.price,
        createProductDto1.stock,
      ],
    );

    await dbService.run(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [
        createProductDto2.name,
        createProductDto2.description,
        createProductDto2.price,
        createProductDto2.stock,
      ],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    const product1 = await dbService.get(
      'SELECT * FROM products WHERE name = ?',
      [createProductDto1.name],
    );

    const product2 = await dbService.get(
      'SELECT * FROM products WHERE name = ?',
      [createProductDto2.name],
    );

    await dbService.run(
      'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user.id, product1.id, 2],
    );

    await dbService.run(
      'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user.id, product2.id, 1],
    );

    return request(app.getHttpServer())
      .delete(`/cart/clear/${user.id}`)
      .expect(200)
      .expect(async () => {
        const cartItems = await dbService.all(
          'SELECT * FROM carts WHERE user_id = ?',
          [user.id],
        );
        expect(cartItems.length).toBe(0);
      });
  });
});
