import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() product: Product): Promise<Product> {
    return this.productsService.create(product);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id') id: number,
    @Body() product: Product,
  ): Promise<Product> {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.productsService.delete(id);
  }
}
