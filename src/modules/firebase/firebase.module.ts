import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  providers: [StorageService, AuthService],
  exports: [StorageService],
  controllers: [AuthController]
})
export class FirebaseModule {}