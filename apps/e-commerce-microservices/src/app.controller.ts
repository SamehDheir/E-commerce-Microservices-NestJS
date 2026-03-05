import {
  Controller,
  Post,
  Body,
  Inject,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { Response } from 'express';
import { RegisterDto } from 'apps/auth/src/dto/RegisterDto';

@Controller('auth')
export class AppController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await lastValueFrom(
      this.client.send({ cmd: 'register' }, registerDto),
    );
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await lastValueFrom(
      this.client.send({ cmd: 'login' }, body),
    );

    if (result && result.access_token) {
      response.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000,
      });

      delete result.access_token;
      return { message: 'Logged in successfully', user: result.user };
    }

    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: false,
    });

    return { message: 'Logged out successfully' };
  }
}
