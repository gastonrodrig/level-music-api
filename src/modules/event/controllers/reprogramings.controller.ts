import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param, 
  HttpCode,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReprogramingsService } from '../services/reprogramings.service';
import { Reprogramings } from '../schema/reprogramings.schema';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { Public } from 'src/auth/decorators';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateReprogramingsDto } from '../dto';

@Controller('reprogramings')
export class ReprogramingsController {
  constructor(private readonly reprogramingsService: ReprogramingsService) {}

  @Post()
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
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
  create(@Body() data: CreateReprogramingsDto) {
    return  this.reprogramingsService.create(data);
  }

  @Get('paginated')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener reprogramaciones con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reprogramaciones obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las reprogramaciones paginadas.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  async findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('created_at')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return await this.reprogramingsService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Get('user/:user_id/paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener las reprogramaciones por usuario con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reprogramaciones encontradas correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reprogramaciones no encontradas',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset de paginación' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar por campos (reason, status)' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar (ejemplo: created_at)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Dirección de ordenamiento' })
  findByUserPaginated(
    @Param('user_id') user_id: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('created_at')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.reprogramingsService.findByUserPaginated(
      user_id,
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

}
