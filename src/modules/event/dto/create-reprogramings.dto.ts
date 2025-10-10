import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateReprogramingsDto {
  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDateString()
  @IsNotEmpty()
  new_date: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDateString()
  @IsNotEmpty()
  new_start_time: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDateString()
  @IsNotEmpty()
  new_end_time: Date;

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ type: String, example: '68ca75fe4289595b8bb1a331' })
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  
}
