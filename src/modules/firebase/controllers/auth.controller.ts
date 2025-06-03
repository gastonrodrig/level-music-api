import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CreateFirebaseUserDto } from '../dto/create-firebase-user.dto';
import { Public } from 'src/auth/decorators';

@Controller('firebase-auth')
@ApiTags('Firebase-Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar usuario con email y contraseña' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al crear el usuario.' })
  async registerWithEmail(@Body() createFirebaseUserDto: CreateFirebaseUserDto) {
    return this.authService.createUserWithEmail(createFirebaseUserDto);
  }
}