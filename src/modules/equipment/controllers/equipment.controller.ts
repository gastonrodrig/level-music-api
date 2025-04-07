import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { CreateEquipmentDto } from '../dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';

@Controller('equipment')
@ApiTags('Equipment')
export class EquipmentController {
  constructor(private readonly equipmentServices: EquipmentService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo equipo' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El equipo ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el equipo.',
  })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentServices.create(createEquipmentDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener todos los equips' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lista de equipos obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los equipos.',
  })
  findAll() {
    return this.equipmentServices.findAll();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener un equipo por ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Equipo encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el equipo.',
  })
  findOne(@Param('id') id: string) {
    return this.equipmentServices.findOne(id);
  }

  // @Put(':id')
  //@Public()
  //@HttpCode(HttpStatus.OK)
  //@ApiOperation({ summary: 'Actualizar un usuario por ID' })
  //@ApiResponse({ status: HttpStatus.OK, description: 'El usuario ha sido actualizado correctamente.' })
  //@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el usuario.' })
  //update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //return this.equipmentServices.update(id, updateUserDto);
  //}

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El usuario ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el usuario.',
  })
  remove(@Param('id') id: string) {
    return this.equipmentServices.remove(id);
  }

  // @Get('findByUid/:uid')
  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Obtiene el usuario por UID' })
  // @ApiResponse({ status: HttpStatus.OK, description: 'El usuario ha sido obtenido correctamente.' })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al obtener el usuario.' })
  // findByUid(@Param('uid') uid: string) {
  //   return this.userService.findByUid(uid);
  // }
}
