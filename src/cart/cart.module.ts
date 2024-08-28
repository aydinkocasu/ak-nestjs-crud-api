import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [CartService, CartRepository, DatabaseService],
  controllers: [CartController],
})
export class CartModule {}
