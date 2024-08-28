import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order, OrderItem } from './order.entity';
import { DatabaseService } from 'src/database/database.service';
import { Product } from 'src/products/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly dbService: DatabaseService,
  ) { }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async create(order: Partial<Order>): Promise<Order> {
    try {
      const { query, productIds } = this._prepareProductQuery(
        order.order_items,
      );
      const products = await this.dbService.all(query, productIds);

      const { totalPrice, orderItems } = this._validateAndCalculateTotal(
        order.order_items,
        products,
      );
      order.total = totalPrice;
      order.order_items = orderItems;

      return this.ordersRepository.create(order);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        'An error occurred while creating the order',
      );
    }
  }

  //async delete(id: number): Promise<{ message: string }> {
  //  const exist = await this.ordersRepository.findOne(id);
  //  if (!exist) {
  //    throw new NotFoundException('Order Not Found');
  //  }
  //  await this.ordersRepository.delete(id);
  //  return { message: `Order with ID ${id} deleted successfully` };
  //}

  private _prepareProductQuery(orderItems: OrderItem[]): {
    query: string;
    productIds: number[];
  } {
    const productIds = orderItems.map((item) => item.product_id);
    const placeholders = productIds.map(() => '?').join(',');
    const query = `SELECT * FROM products WHERE id IN (${placeholders})`;
    return { query, productIds };
  }

  private _validateAndCalculateTotal(
    orderItems: OrderItem[],
    products: Product[],
  ): { totalPrice: number; orderItems: OrderItem[] } {
    let totalPrice = 0;
    const validatedOrderItems = orderItems.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product with ID ${item.product_id}`,
        );
      }

      const updatedItem = { ...item, price: product.price };
      totalPrice += product.price * item.quantity;
      return updatedItem;
    });

    return { totalPrice, orderItems: validatedOrderItems };
  }
}
