import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.['access_token'];

    if (!token) throw new UnauthorizedException('No token found');

    try {
      const isValid = await lastValueFrom(
        this.client.send({ cmd: 'validate_token' }, { token }),
      );
      return isValid;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
