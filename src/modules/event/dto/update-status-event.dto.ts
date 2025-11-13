import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {StatusType} from '../enum/';

export class UpdateStatusEventDto {
  @ApiProperty({ enum: StatusType, example: StatusType.EN_REVISION })
  @IsEnum(StatusType)
  @IsOptional()
  status?: StatusType;
}
