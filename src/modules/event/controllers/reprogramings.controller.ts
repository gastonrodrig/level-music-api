import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReprogramingsService } from '../services/reprogramings.service';
import { Reprogramings } from '../schema/reprogramings.schema';
import { Public } from 'src/auth/decorators';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('reprogramings')
export class ReprogramingsController {
  constructor(private readonly reprogramingsService: ReprogramingsService) {}

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
  async create(@Body() data: Partial<Reprogramings>) {
    return await this.reprogramingsService.create(data);
  }

  @Get()
  async findAllPaginated(
    @Query('limit') limit = 5,
    @Query('offset') offset = 0,
    @Query('search') search = '',
    @Query('sortField') sortField = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return await this.reprogramingsService.findAllPaginated(
      Number(limit),
      Number(offset),
      search,
      sortField,
      sortOrder,
    );
  }
}
