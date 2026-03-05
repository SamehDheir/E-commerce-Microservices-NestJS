import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: 'products_db', 
      entities: [Product],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductModule {}