import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignationsService } from '../services';
import { CreateAssignationDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';

@Controller('assignations')
@ApiTags('Assignations')
export class AssignationsController {
  constructor(private readonly assignationsService: AssignationsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva asignación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asignación creada correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la asignación',
  })
  create(@Body() createAssignationDto: CreateAssignationDto) {
    return this.assignationsService.create(createAssignationDto);
  }

  @Get('availability/equipment/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar disponibilidad de un equipo en un rango de horas' })
  @ApiQuery({ name: 'from', type: String, example: '2025-10-02T18:00:00Z' })
  @ApiQuery({ name: 'to', type: String, example: '2025-10-02T23:00:00Z' })
  @ApiQuery({ name: 'eventCode', required: false, type: String })
  async checkEquipmentAvailability(
    @Param('id') equipment_id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('eventCode') eventCode?: string,
  ) {
    await this.assignationsService.validateResourceAvailability(
      equipment_id,
      new Date(from),
      new Date(to),
      eventCode
    );
  }

  @Get('availability/worker/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar disponibilidad de un trabajador en un rango de horas' })
  @ApiQuery({ name: 'from', type: String, example: '2025-10-02T18:00:00Z' })
  @ApiQuery({ name: 'to', type: String, example: '2025-10-02T23:00:00Z' })
  @ApiQuery({ name: 'eventCode', required: false, type: String })
  async checkWorkerAvailability(
    @Param('id') worker_id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('eventCode') eventCode?: string,
  ) {
    await this.assignationsService.validateResourceAvailability(
      worker_id,
      new Date(from),
      new Date(to),
      eventCode
    );
  }

  @Get('availability/service-detail/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar disponibilidad de un servicio adicional en un rango de horas' })
  @ApiQuery({ name: 'from', type: String, example: '2025-10-02T18:00:00Z' })
  @ApiQuery({ name: 'to', type: String, example: '2025-10-02T23:00:00Z' })
  @ApiQuery({ name: 'eventCode', required: false, type: String })
  async checkServiceDetailAvailability(
    @Param('id') serviceDetail_id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('eventCode') eventCode?: string,
  ) {
    await this.assignationsService.validateResourceAvailability(
      serviceDetail_id,
      new Date(from),
      new Date(to),
      eventCode
    );
  }
}