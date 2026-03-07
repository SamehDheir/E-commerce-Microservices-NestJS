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
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from 'apps/products/src/dto/create-product.dto';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { File } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async createProduct(
    @Body() data: CreateProductDto,
    @UploadedFile() file: File,
    @Req() req: any,
  ) {
    return await lastValueFrom(
      this.productClient.send(
        { cmd: 'create_product' },
        {
          ...data,
          imageUrl: file ? file.path : null,
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

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      // تأكد أن المفتاح هو imageUrl في Postman
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async updateProduct(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file: File,
    @Req() req: any,
  ) {
    const oldProduct = await lastValueFrom(
      this.productClient.send({ cmd: 'get_one_product' }, { id }),
    );

    if (file && oldProduct?.imageUrl) {
      const oldImagePath = path.join(process.cwd(), oldProduct.imageUrl);

      // 3. حذف الصورة القديمة
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`🗑️ Deleted old image: ${oldImagePath}`);
      }

      // 4. تحديث المسار في البيانات المرسلة
      (updateData as any).imageUrl = file.path;
    }
    return await lastValueFrom(
      this.productClient.send(
        { cmd: 'update_product' },
        {
          id,
          updateData,
          userId: req.user.id,
        },
      ),
    );
  }
}
