import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductModule } from './products.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen();
}
bootstrap();
