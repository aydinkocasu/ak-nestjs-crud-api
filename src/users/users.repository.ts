import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly dbService: DatabaseService) { }

  async exist(id: number): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE id = ?';
    const values = [id];
    const result = this.dbService.get(query, values);
    return result;
  }

  async findAll(): Promise<User[]> {
    const query = 'SELECT id, user_name, is_admin, created_at FROM users';
    return this.dbService.all(query);
  }

  async findOne(id: number): Promise<User> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const values = [id];
    return this.dbService.get(query, values);
  }

  async findByUsername(user_name: string): Promise<User> {
    const query = 'SELECT * FROM users WHERE user_name = ?';
    const values = [user_name];
    return this.dbService.get(query, values);
  }

  // FIX: WE ARE RETURNING PASSWORD BRO!
  // TODO: NEED TO CREATE SEPERATE FUNC FOR RETRUNING USER
  async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    console.log(user, 'USER');
    const query = `
      INSERT INTO users (user_name, password, is_admin)
      VALUES (?, ?, ?)
      RETURNING id, user_name, is_admin, created_at, password;
    `;
    const values = [user.user_name, user.password, user.is_admin];
    return this.dbService.get(query, values);
  }

  async update(
    id: number,
    user: Omit<User, 'id' | 'created_at'>,
  ): Promise<User> {
    const query = `
      UPDATE users
      SET user_name = ?, password = ?, is_admin = ?
      WHERE id = ?
      RETURNING id, user_name, is_admin, created_at;
    `;
    const values = [user.user_name, user.password, user.is_admin, id];
    return this.dbService.get(query, values);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM users WHERE id = ?';
    await this.dbService.run(query, [id]);
  }
}
