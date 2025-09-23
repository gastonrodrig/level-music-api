import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    HttpCode,
    HttpStatus,
    DefaultValuePipe,
    Query,
    ParseIntPipe,
 } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { AssignationsService } from '../services';
import { CreateAssignationDto } from '../dto';

@Controller('assignations')
@ApiTags('Assignations')

export class AssignationsController {
  constructor(private readonly assignationsService: AssignationsService) {}

  @Post()
  @Public()
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

  // @Get('paginated')
  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Obtener asignaciones con paginación, búsqueda y orden' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Lista de asignaciones obtenida correctamente.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Error al obtener las asignaciones.',
  // })
  // @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  // @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  // @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  // @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  // @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  // findAllPaginated(
  //   @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  //   @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
  //   @Query('search') search?: string,
  //   @Query('sortField', new DefaultValuePipe('available_from')) sortField?: string,
  //   @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  // ) {
  //   return this.assignationsService.findAllPaginated(
  //     limit,
  //     offset,
  //     search?.trim(),
  //     sortField,
  //     sortOrder,
  //   );
  // }
}