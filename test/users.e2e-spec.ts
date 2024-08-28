import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Users (e2e)', () => {
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
    await dbService.run('DROP TABLE IF EXISTS users');

    const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    await dbService.run(userTableQuery);
  });

  it('/users (POST)', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.user_name).toEqual(createUserDto.user_name);
        expect(res.body.password).toEqual(createUserDto.password);
      });
  });

  it('/users (GET)', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_name).toEqual(createUserDto.user_name);
        expect(res.body[0].password).toEqual(createUserDto.password);
      });
  });

  it('/users/:id (GET)', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    expect(user).toBeDefined(); // Ensure user is found

    return request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.user_name).toEqual(createUserDto.user_name);
        expect(res.body.password).toEqual(createUserDto.password);
      });
  });

  it('/users/:id (PUT)', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    expect(user).toBeDefined(); // Ensure user is found

    const updateUserDto = {
      user_name: 'updateduser',
      password: 'updatedpassword',
    };

    return request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send(updateUserDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.user_name).toEqual(updateUserDto.user_name);
        expect(res.body.password).toEqual(updateUserDto.password);
      });
  });

  it('/users/:id (DELETE)', async () => {
    const createUserDto = {
      user_name: 'testuser',
      password: 'testpassword',
    };

    await dbService.run(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [createUserDto.user_name, createUserDto.password],
    );

    const user = await dbService.get(
      'SELECT * FROM users WHERE user_name = ?',
      [createUserDto.user_name],
    );

    expect(user).toBeDefined(); // Ensure user is found

    return request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .expect(200)
      .expect(async () => {
        //        const deletedUser = await dbService.get(
        //          'SELECT * FROM users WHERE id = ?',
        //          [user.id],
        //        );
        //        expect(deletedUser).toBeUndefined(); // User should be undefined after deletion
      });
  });
});
