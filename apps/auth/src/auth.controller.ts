import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'validate_token' })
  validateToken(data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
