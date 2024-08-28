import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [OrdersService, OrdersRepository, DatabaseService],
  controllers: [OrdersController],
})
export class OrdersModule {}
