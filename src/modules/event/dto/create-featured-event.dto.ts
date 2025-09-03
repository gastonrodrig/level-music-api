import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString , IsOptional} from 'class-validator';

export class CreateFeaturedEventDto {
  @ApiProperty({ example: '64f1c7e...', description: 'ID del evento base' })
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({ example: 'Festival de Música Electrónica' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Un show con los mejores DJs internacionales' })
  @IsString()
  @IsNotEmpty()
  featured_description: string;

  @ApiProperty({
    description:
      'Servicios; puede llegar como JSON string o como array de objetos { title, description }',
    example:
      '[{ "title": "Escenario Principal", "description": "Con sonido y pantallas LED" }]',
  })
  @IsNotEmpty()
  services: any;

  @ApiProperty({
    type: 'array',
    required: false,
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  images?: any;
}
