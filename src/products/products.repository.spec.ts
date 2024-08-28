import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from './products.repository';
import { DatabaseService } from '../database/database.service';
import { Product } from './product.entity';

describe('ProductsRepository', () => {
  let productsRepository: ProductsRepository;

  const mockDbService = {
    run: jest.fn() as jest.MockedFunction<
      (query: string, params?: any[]) => Promise<void>
    >,
    get: jest.fn() as jest.MockedFunction<
      (query: string, params?: any[]) => Promise<any>
    >,
    all: jest.fn() as jest.MockedFunction<
      (query: string, params?: any[]) => Promise<any[]>
    >,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    productsRepository = module.get<ProductsRepository>(ProductsRepository);
  });

  it('should be defined', () => {
    expect(productsRepository).toBeDefined();
  });

  it('should return all products', async () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Product 1',
        description: 'Desc 1',
        price: 100,
        stock: 10,
      },
      {
        id: 2,
        name: 'Product 2',
        description: 'Desc 2',
        price: 200,
        stock: 20,
      },
    ];

    mockDbService.all.mockResolvedValue(mockProducts);
    const products = await productsRepository.findAll();
    expect(products).toEqual(mockProducts);
  });

  it('should return a single product', async () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Product 1',
      description: 'Desc 1',
      price: 100,
      stock: 10,
    };

    mockDbService.get.mockResolvedValue(mockProduct);
    const product = await productsRepository.findOne(1);
    expect(product).toEqual(mockProduct);
  });

  it('should create a product', async () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Product 1',
      description: 'Desc 1',
      price: 100,
      stock: 10,
    };

    mockDbService.run.mockResolvedValue(undefined);
    await productsRepository.create(mockProduct);
    expect(mockDbService.run).toHaveBeenCalledWith(
      'INSERT INTO products (name, description, price, stock)',
      [
        mockProduct.name,
        mockProduct.description,
        mockProduct.price,
        mockProduct.stock,
      ],
    );
  });

  it('should update a product', async () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Product 1',
      description: 'Desc 1',
      price: 100,
      stock: 10,
    };

    mockDbService.run.mockResolvedValue(undefined);
    await productsRepository.update(1, mockProduct);
    expect(mockDbService.run).toHaveBeenCalledWith(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
      [
        mockProduct.name,
        mockProduct.description,
        mockProduct.price,
        mockProduct.stock,
        1,
      ],
    );
  });

  it('should delete a product', async () => {
    mockDbService.run.mockResolvedValue(undefined);
    await productsRepository.delete(1);
    expect(mockDbService.run).toHaveBeenCalledWith(
      'DELETE FROM products WHERE id = ?',
      [1],
    );
  });
});
