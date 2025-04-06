import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { ApiTags, ApiSecurity, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../auth/decorators';
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

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuarios obtenida correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al obtener los usuarios.' })
  findAll() {
    return this.userService.findAll();
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

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El usuario ha sido eliminado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al eliminar el usuario.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('find/:email')
  @Public()
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
