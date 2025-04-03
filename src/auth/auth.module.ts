import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard, RolesGuard } from './guards';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthService
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {} 