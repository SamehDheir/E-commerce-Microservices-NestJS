import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Create a new product with logging
  async createProduct(data: any) { // الـ data هنا تحتوي على المنتج + userId
    try {
      const product = this.productRepo.create(data);
      return await this.productRepo.save(product);
    } catch (error) {
      console.error('DATABASE ERROR:', error);
      throw error;
    }
  }

  // Get all products with pagination
  async findAll(page: number = 1, limit: number = 10) {
    const [result, total] = await this.productRepo.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: result,
      count: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
