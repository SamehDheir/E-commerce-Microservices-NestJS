import { Controller, Get, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async handleCreateProduct(@Payload() data: any) {
    return await this.productsService.createProduct(data);
  }

  @MessagePattern({ cmd: 'get_all_products' })
  async handleGetAllProducts(data: { page: number; limit: number }) {
    return await this.productsService.findAll(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'get_one_product' })
  async handleGetOne(@Payload('id', ParseUUIDPipe) id: string) {
    return await this.productsService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_product' })
  async handleUpdate(
    @Payload()
    data: {
      id: string;
      updateData: UpdateProductDto;
      userId: string;
    },
  ) {
    return await this.productsService.update(
      data.id,
      data.updateData,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'delete_product' })
  async handleDelete(@Payload('id', ParseUUIDPipe) id: string) {
    return await this.productsService.remove(id);
  }
}
