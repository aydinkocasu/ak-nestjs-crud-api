import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { CreateDto } from './dto/create.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true })) createDto: CreateDto,
  ): Promise<User> {
    return this.usersService.create(
      createDto as { user_name: string; password: string; is_admin: boolean },
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) createDto: CreateDto,
  ): Promise<User> {
    return this.usersService.update(
      id,
      createDto as { user_name: string; password: string; is_admin: boolean },
    );
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<{ message: string }> {
    return this.usersService.delete(id);
  }
}
