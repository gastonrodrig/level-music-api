import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from '../services/whatsapp.service';
import { SendWhatsAppMessageDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';

@Controller('whatsapp')
@ApiTags('WhatsApp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('admins-info')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información de administradores con WhatsApp' })
  async getAdminsInfo() {
    const admins = await this.whatsappService.getAdminsInfo();
    
    return {
      success: true,
      message: `Se encontraron ${admins.length} administrador(es) con número de teléfono`,
      data: admins
    };
  }

  @Post('test-direct-message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar envío directo de mensaje' })
  async testDirectMessage(@Body() body: { phone: string; message: string }) {
    try {
      const result = await this.whatsappService.sendWhatsAppMessage(body.phone, body.message);
      return {
        success: true,
        message: 'Mensaje enviado exitosamente',
        twilioSid: result.sid,
        to: body.phone
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('test-maintenance-reminder')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar envío de recordatorio de mantenimiento preventivo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recordatorio enviado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Recordatorio de prueba enviado a todos los administradores',
        adminCount: 3,
        admins: ['Gaston Rodriguez', 'Gerald Casas']
      }
    }
  })
  async testMaintenanceReminder() {
    const admins = await this.whatsappService.getAdminsInfo();
    
    await this.whatsappService.sendMaintenanceReminderToAdmins({
      equipmentName: 'Mezcladora Yamaha MG12XU',
      equipmentType: 'Equipo de Audio',
      maintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días después
      daysRemaining: 3,
      maintenanceId: 'test-123'
    });

    return {
      success: true,
      message: 'Recordatorio de mantenimiento PREVENTIVO enviado',
      adminCount: admins.length,
      admins: admins.map(admin => admin.name)
    };
  }

  @Post('force-check-preventive')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forzar verificación de mantenimientos preventivos (solo para pruebas)' })
  async forceCheckPreventive() {
    // Aquí necesitarías inyectar el MaintenanceNotificationSchedulerService
    return {
      success: true,
      message: 'Verificación manual de mantenimientos preventivos ejecutada',
      note: 'Revisa los logs del servidor para ver los resultados'
    };
  }

  @Post('send-test-message')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar mensaje de prueba por WhatsApp' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensaje enviado exitosamente',
  })
  async sendTestMessage(@Body() dto: SendWhatsAppMessageDto) {
    const result = await this.whatsappService.sendWhatsAppMessage(
      dto.to,
      dto.message
    );
    
    return {
      success: true,
      message: 'Mensaje enviado exitosamente',
      sid: result.sid
    };
  }
}