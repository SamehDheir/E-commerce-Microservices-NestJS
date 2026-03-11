import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: Number(process.env.PAYMENT_SERVICE_PORT) || 3004,
      },
    },
  );
  await app.listen();
  console.log('💳 Payment Microservice is listening on port 3004...');
}
bootstrap();
