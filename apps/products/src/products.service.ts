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
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Create a new product with logging
  async createProduct(data: CreateProductDto) {
    try {
      const product = this.productRepo.create(data);
      return await this.productRepo.save(product);
    } catch (error) {
      console.error('DATABASE ERROR:', error);
      throw error;
    }
  }

  // Get all products with pagination
  async findAll(filterDto: FilterProductDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = filterDto;

    const query = this.productRepo.createQueryBuilder('product');

    if (search) {
      query.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      count: total,
      currentPage: +page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // apps/products/src/products.service.ts

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

  // Update a product by ID
  async update(id: string, updateData: UpdateProductDto, userId: string) {
    const product = await this.productRepo.findOne({ where: { id, userId } });

    if (!product) {
      throw new NotFoundException(
        'Product not found or you do not have permission',
      );
    }

    const updatedProduct = this.productRepo.merge(product, updateData);

    return await this.productRepo.save(updatedProduct);
  }
}
