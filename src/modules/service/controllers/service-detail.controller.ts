import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceDetailService } from '../services';
import { FirebaseAuthGuard } from 'src/auth/guards';

@ApiTags('Service Details')
@Controller('service-details')
export class ServiceDetailController {
  constructor(private readonly serviceDetailService: ServiceDetailService) {}

  @Get('all')
  @ApiBearerAuth('firebase-auth')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los detalles de servicio activos.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de detalles de servicios activos.',
  })
  async findAll() {
    return this.serviceDetailService.findAllActive();
  }
}
