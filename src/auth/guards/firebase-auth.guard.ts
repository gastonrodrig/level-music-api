import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Is public route: ${isPublic}`);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    this.logger.debug(`Auth header: ${authHeader}`);

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      request.user = {
        uid: token.split('.')[1],
        rol: token.includes('Administrador') ? 'Administrador' : 'Cliente'
      };
      return true;
    } catch (error) {
      this.logger.error(`Error processing token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
} 