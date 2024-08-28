import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DatabaseService } from '../database/database.service';
import { PasswordService } from '../common/password.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, DatabaseService, PasswordService],
  exports: [UsersService],
})
export class UsersModule { }
