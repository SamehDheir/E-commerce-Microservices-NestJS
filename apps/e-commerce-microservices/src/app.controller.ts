import { Controller, Post, Body, Inject, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Response } from 'express';

@Controller('auth')
export class AppController {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  @Post('register')
  register(@Body() body: any) {
    return this.client.send({ cmd: 'register' }, body);
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) response: any) {
    const result = await lastValueFrom(
      this.client.send({ cmd: 'login' }, body),
    );

    if (result.access_token) {
      response.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000, // 1h
      });
      return { message: 'Success' };
    }
    return result;
  }
}
