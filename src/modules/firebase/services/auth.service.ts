import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateFirebaseUserDto, UpdateFirebaseUserDto } from '../dto';

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

  async updateUserEmail(uid: string, dto: UpdateFirebaseUserDto): Promise<{ success: boolean; uid?: string; message: string }> {
    try {
      const { email } = dto;
      const userRecord = await admin.auth().updateUser(uid, { email });
      return {
        success: true,
        uid: userRecord.uid,
        message: 'Correo actualizado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el correo',
      };
    }
  }
  
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${process.env.APP_URL}/auth/reset-password`,
        handleCodeInApp: true,
      });
      return resetLink;
    } catch (error) {
      throw new Error(error.message || 'No se pudo generar el enlace de reseteo');
    }
  }
}