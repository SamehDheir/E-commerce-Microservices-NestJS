import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  Query,
  UseGuards,
  Req,
  Delete,
  Param,
  NotFoundException,
  InternalServerErrorException,
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

  @UseGuards(AuthGuard)
  @Post()
  async createProduct(@Body() data: CreateProductDto, @Req() req: any) {
    return await lastValueFrom(
      this.productClient.send(
        { cmd: 'create_product' },
        {
          ...data,
          userId: req.user.id,
        },
      ),
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

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    try {
      return await lastValueFrom(
        this.productClient.send({ cmd: 'get_one_product' }, { id }),
      );
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Get Product failed');
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    try {
      return await lastValueFrom(
        this.productClient.send({ cmd: 'delete_product' }, { id }),
      );
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('deletion failed');
    }
  }
}
