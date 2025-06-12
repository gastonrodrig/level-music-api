import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpCode, HttpStatus, NotFoundException, UseGuards, DefaultValuePipe, ParseIntPipe, Patch } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { FirebaseAuthGuard } from 'src/auth/guards';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'El usuario ha sido creado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al crear el usuario.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('customers-paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener clientes con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los clientes paginados.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  findAllCustomersPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.userService.findAllCustomersPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario encontrado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al obtener el usuario.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El usuario ha sido actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el usuario.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Get('find/:email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por Email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El usuario ha sido obtenido correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al obtener el usuario.' })
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Patch('reset-password-flag/:uid')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear el flag de cambio de contraseña para un usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El flag de cambio de contraseña ha sido reseteado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al resetear el flag de cambio de contraseña.' })
  resetPasswordChangeFlag(@Param('uid') id: string) {
    return this.userService.resetPasswordChangeFlag(id);
  }
}
