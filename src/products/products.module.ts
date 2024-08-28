import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { DatabaseService } from '../database/database.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, DatabaseService],
})
export class ProductsModule { }
