import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {StatusType} from '../enum/';

export class UpdateStatusEventDto {
  @ApiProperty({ enum: StatusType, example: StatusType.EDITADO })
  @IsEnum(StatusType)
  @IsOptional()
  status?: StatusType;
}
