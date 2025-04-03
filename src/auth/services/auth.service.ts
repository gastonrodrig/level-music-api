import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Roles } from '../../core/constants/app.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async createCustomToken(userId: string, role: Roles): Promise<{ token: string }> {
    try {
      const additionalClaims = {
        rol: role
      };

      this.logger.debug(`Creating token for user ${userId} with role ${role}`);
      const customToken = await admin.auth().createCustomToken(userId, additionalClaims);
      
      this.logger.debug(`Token created successfully`);
      return { 
        token: `Bearer ${customToken}`
      };
    } catch (error) {
      this.logger.error(`Error creating token: ${error.message}`);
      throw error;
    }
  }
} 