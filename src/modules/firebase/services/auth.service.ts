import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateFirebaseUserDto } from '../dto/create-firebase-user.dto';

@Injectable()
export class AuthService {
  async createUserWithEmail(createFirebaseUserDto: CreateFirebaseUserDto): Promise<{ success: boolean; uid?: string; message: string }> {
    try {
      const { email, password } = createFirebaseUserDto;
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });
      return {
        success: true,
        uid: userRecord.uid,
        message: 'Usuario creado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al crear el usuario',
      };
    }
  }
}