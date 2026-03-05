import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async handleCreateProduct(data: CreateProductDto) {
    return await this.productsService.createProduct(data);
  }

  @MessagePattern({ cmd: 'get_all_products' })
  async handleGetAllProducts(data: { page: number; limit: number }) {
    return await this.productsService.findAll(data.page, data.limit);
  }
}
