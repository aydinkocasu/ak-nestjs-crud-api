import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(product: Product): Promise<Product> {
    return this.productsRepository.create(product);
  }

  async update(id: number, product: Product): Promise<Product> {
    const exist = await this.productsRepository.exist(id);
    if (!exist) {
      throw new NotFoundException('Product Not Found');
    }
    return this.productsRepository.update(id, product);
  }

  async delete(id: number): Promise<{ message: string }> {
    const exist = await this.productsRepository.exist(id);
    if (!exist) {
      throw new NotFoundException('Product Not Found');
    }
    await this.productsRepository.delete(id);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
