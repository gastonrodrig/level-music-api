import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Roles } from '../../core/constants/app.constants';
import { Public } from '../decorators';

class GenerateTokenDto {
  userId: string;
  role: Roles;
}

class TokenResponse {
  token: string;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate-admin-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generar token de prueba con rol Administrador',
    description: 'Genera un token con el prefijo Bearer listo para usar en el botón Authorize'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token generado correctamente',
    type: TokenResponse
  })
  async generateAdminToken() {
    return this.authService.createCustomToken('test-admin-user', Roles.ADMIN);
  }

  @Post('generate-client-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generar token de prueba con rol Cliente',
    description: 'Genera un token con el prefijo Bearer listo para usar en el botón Authorize'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token generado correctamente',
    type: TokenResponse
  })
  async generateClientToken() {
    return this.authService.createCustomToken('test-client-user', Roles.CLIENTE);
  }

  @Post('generate-custom-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generar token personalizado',
    description: 'Genera un token con el prefijo Bearer listo para usar en el botón Authorize'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token generado correctamente',
    type: TokenResponse
  })
  async generateCustomToken(@Body() generateTokenDto: GenerateTokenDto) {
    return this.authService.createCustomToken(generateTokenDto.userId, generateTokenDto.role);
  }
} 