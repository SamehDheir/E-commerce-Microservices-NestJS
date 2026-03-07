import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from 'apps/products/src/dto/create-product.dto';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

// apps/gateway/src/products.controller.ts
@UseGuards(AuthGuard)
@Post()
async createProduct(@Body() data: any, @Req() req: any) {
  // الـ Gateway هو المكان الوحيد الذي يوجد فيه client.send
  return await lastValueFrom(
    this.productClient.send({ cmd: 'create_product' }, { 
      ...data, 
      userId: req.user.id 
    })
  );
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
