// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('AuthController (e2e)', () => {
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
    await dbService.run('DELETE FROM users'); // Clean up database
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ user_name: 'testuser', password: 'testpassword' })
      .expect(201);

    expect(response.body.message).toEqual('User testuser created successfully');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user_name: 'testuser', password: 'testpassword' })
      .expect(201);

    expect(response.body.access_token).toBeDefined();
    expect(response.body.refresh_token).toBeDefined();
  });

  it('/auth/validate (GET)', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user_name: 'testuser', password: 'testpassword' })
      .expect(201);

    const accessToken = loginResponse.body.access_token;

    const validateResponse = await request(app.getHttpServer())
      .get('/auth/validate')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(validateResponse.body.user_name).toEqual('testuser');
  });

  it('/auth/refresh (POST)', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user_name: 'testuser', password: 'testpassword' })
      .expect(201);

    const { user_id } = loginResponse.body.user;
    const refreshToken = loginResponse.body.refresh_token;

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ user_id, refresh_token: refreshToken })
      .expect(201);

    expect(refreshResponse.body.access_token).toBeDefined();
    expect(refreshResponse.body.refresh_token).toBeDefined();
  });
});
