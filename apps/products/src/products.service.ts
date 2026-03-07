import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  async createProduct(data: any) {
    // الـ data هنا تحتوي على المنتج + userId
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

  // Get a single product by ID
  async findOne(id: string) {
    if (!id) throw new BadRequestException('ID is required');

    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // Delete a product by ID
  async remove(id: string) {
    const result = await this.productRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return { message: 'Product deleted successfully' };
  }
}
