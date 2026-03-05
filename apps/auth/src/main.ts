import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.TCP,
   options: {
      host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
      port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
    },
  });
  await app.listen();
  console.log('✅ Auth Microservice is listening on port 3001');
}
bootstrap();