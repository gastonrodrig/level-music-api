import {
  Controller,
  Post,
  Patch,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBody 
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ServiceDetailService } from '../services';
import { CreateServiceDetailDto } from '../dto';
import { ServiceDetail } from '../schema';

@ApiTags('Service Details')
@Controller('service-details')
export class ServiceDetailController {
  constructor(private readonly serviceDetailService: ServiceDetailService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo detalle de servicio' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El detalle de servicio ha sido creado correctamente.',
    type: ServiceDetail,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el detalle de servicio.',
  })
  async create(@Body() createServiceDetailDto: CreateServiceDetailDto) {
    return await this.serviceDetailService.create(createServiceDetailDto);
  }

  @Patch(':id/media')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subir y reemplazar las imágenes de un detalle de servicio' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Las imágenes se han actualizado correctamente.',
    type: ServiceDetail,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar las imágenes del detalle de servicio.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Lista de archivos a subir',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20))
  async updateMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.serviceDetailService.updateMedia(id, files);
  }

  @Get('service/:serviceId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalles de servicio por ID de servicio' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalles de servicio obtenidos correctamente.',
    type: [ServiceDetail],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontraron detalles para el ID de servicio proporcionado.',
  })
  async getServiceDetailsByServiceId(@Param('serviceId') serviceId: string) {
    return await this.serviceDetailService.getServiceDetailsByServiceId(serviceId);
  }
}
