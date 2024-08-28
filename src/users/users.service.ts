import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import { PasswordService } from '../common/password.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) { }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(userName: string): Promise<User> {
    return this.usersRepository.findByUsername(userName);
  }

  async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const exist = await this.usersRepository.findByUsername(user.user_name);
    if (exist) {
      throw new ConflictException('Username already exists');
    }
    user.password = await this.passwordService.hashPassword(user.password);
    return this.usersRepository.create(user);
  }

  async update(
    id: number,
    user: Omit<User, 'id' | 'created_at'>,
  ): Promise<User> {
    const exist = await this.usersRepository.exist(id);
    if (!exist) {
      throw new NotFoundException('User Not Found');
    }
    if (user.password) {
      user.password = await this.passwordService.hashPassword(user.password);
    }
    return this.usersRepository.update(id, user);
  }

  async delete(id: number): Promise<{ message: string }> {
    const exist = await this.usersRepository.exist(id);
    if (!exist) {
      throw new NotFoundException('User Not Found');
    }
    await this.usersRepository.delete(id);
    return { message: `User with ID ${id} deleted successfully` };
  }
}
