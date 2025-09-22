import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceDetailService, ServiceService } from '../services';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { Public } from 'src/auth/decorators';

@ApiTags('Service Details')
@Controller('service-details')
export class ServiceDetailController {
  constructor(private readonly serviceDetailService: ServiceDetailService) {}

  @Get('all')
  @Public()
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
