import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EventTypeService } from "../services/event-type.service";
import { Public } from "src/auth/decorators";
import { CreateEventTypeDto } from "../dto/create-event_type.dto";

@Controller('event-type')
@ApiTags('Event-Type')
export class EventTypeController {
    constructor(private readonly eventTypeService: EventTypeService){}
    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo tipo de evento' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'El tipo de evento ha sido creado correctamente.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al crear el tipo de evento.',
    })
    create(@Body() createEventTypeDto: CreateEventTypeDto) {
        return this.eventTypeService.create(createEventTypeDto);
    }

    @Get()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Obtener todos los tipos de eventos' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Lista de tipos de eventos obtenida correctamente.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al obtener los tipos de eventos.',
    })
    findAll() {
        return this.eventTypeService.findAll();
    }

    @Get(':id')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Obtener un tipo de evento por ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tipo de evento encontrado correctamente.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al obtener el tipo de evento.',
    })
    findOne(@Param('id') id: string) {
        return this.eventTypeService.findOne(id);
    }

    @Delete(':id')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Eliminar un tipo de evento por ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tipo de evento eliminado correctamente.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Error al eliminar el tipo de evento.',
    })
    remove(@Param('id') id: string) {
        return this.eventTypeService.remove(id);
    }
}