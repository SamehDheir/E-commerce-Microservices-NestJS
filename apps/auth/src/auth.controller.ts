import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';

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
  async validateToken(@Payload() data: ValidateTokenDto) {
    return await this.authService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  forgotPassword(data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async handleResetPassword(data: ResetPasswordDto) {
    return await this.authService.resetPassword(data);
  }
}
