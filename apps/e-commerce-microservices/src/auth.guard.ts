import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token =
      request.cookies?.['access_token'] ||
      request.headers['authorization']?.split(' ')[1];

    if (!token)
      throw new UnauthorizedException('Authentication token not found');

    try {
      const user = await lastValueFrom(
        this.client.send({ cmd: 'validate_token' }, { token }).pipe(
          timeout(5000),
          catchError(() => of(null)),
        ),
      );

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      request.user = user;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Identity verification failed');
    }
  }
}
