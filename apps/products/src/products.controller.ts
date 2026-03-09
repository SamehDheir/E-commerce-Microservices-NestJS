import { Controller, Get, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async handleCreateProduct(@Payload() data: any) {
    return await this.productsService.createProduct(data);
  }

  @MessagePattern({ cmd: 'get_all_products' })
  async handleGetAllProducts(filterDto: FilterProductDto) {
    return await this.productsService.findAll(filterDto);
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

  @EventPattern({ cmd: 'reduce_stock' })
  async handleReduceStock(data: { id: string; quantity: number }) {
    try {
      const product = await this.productsService.findOne(data.id);
      product.stock -= data.quantity;
      await this.productsService.update(
        product.id,
        { stock: product.stock },
        product.userId,
      );
      console.log(
        `📉 Stock reduced for ${product.name}. New stock: ${product.stock}`,
      );
    } catch (error) {
      console.error(
        `Error reducing stock for product ${data.id}:`,
        error.message,
      );
    }
  }

  @EventPattern({ cmd: 'increase_stock' })
  async handleIncreaseStock(data: { id: string; quantity: number }) {
    try {
      const product = await this.productsService.findOne(data.id);
      product.stock += data.quantity;
      await this.productsService.update(
        product.id,
        { stock: product.stock },
        product.userId,
      );
      console.log(
        `📈 Stock increased for ${product.name}. New stock: ${product.stock}`,
      );
    } catch (error) {
      console.error(
        `Error increasing stock for product ${data.id}:`,
        error.message,
      );
    }
  }
}
