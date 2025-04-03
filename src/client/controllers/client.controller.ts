import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { CreateClientDto, UpdateClientDto } from '../dto';
import { ApiTags, ApiSecurity, ApiBearerAuth, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Public, Roles } from '../../auth/decorators';
import { Roles as UserRoles } from '../../core/constants/app.constants';

@Controller('client')
@ApiTags('Client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'El cliente ha sido creado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al crear el cliente.' })
  @ApiBody({ type: CreateClientDto })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @Roles('Administrador', UserRoles.CLIENTE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de clientes obtenida correctamente.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'No tiene permisos para ver los clientes.' })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente encontrado correctamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'No tiene permisos para ver este cliente.' })
  @Roles(UserRoles.ADMIN, UserRoles.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'No tiene permisos para actualizar este cliente.' })
  @Roles(UserRoles.ADMIN)
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente eliminado correctamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'No tiene permisos para eliminar este cliente.' })
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
} 