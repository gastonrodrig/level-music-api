

import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Put, 
    Delete,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Query,

 } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/create-event.dto';


@Controller('events')
@ApiTags('Events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo evento' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Evento creado correctamente',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al crear el evento',
    })
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto);
    }

    @Get()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Obtener todos los eventos' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Lista de eventos obtenida correctamente',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al obtener los eventos',
    })
    findAll() {
        return this.eventService.findAll();
    }

    @Get(':id')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Obtener un evento por ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Evento encontrado correctamente',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Evento no encontrado',
    })
    findOne(@Param('id') event_id: string) {
        return this.eventService.findOne(event_id);
    }

    @Delete(':id')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Eliminar un evento por ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Evento eliminado correctamente',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Evento no encontrado',
    })
    remove(@Param('id') event_id: string) {
        return this.eventService.remove(event_id);
    }

}