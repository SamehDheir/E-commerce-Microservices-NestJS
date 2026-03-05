import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AppController {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  @Post('register')
  register(@Body() body: any) {
    return this.client.send({ cmd: 'register' }, body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.client.send({ cmd: 'login' }, body);
  }
}