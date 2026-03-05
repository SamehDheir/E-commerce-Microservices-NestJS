import { Controller, Post, Get, Body, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from 'apps/products/src/dto/create-product.dto';
import { lastValueFrom } from 'rxjs';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Post()
  async createProduct(@Body() data: CreateProductDto) {
    try {
      return await lastValueFrom(
        this.productClient.send({ cmd: 'create_product' }, data),
      );
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await lastValueFrom(
      this.productClient.send({ cmd: 'get_all_products' }, { page, limit }),
    );
  }
}
