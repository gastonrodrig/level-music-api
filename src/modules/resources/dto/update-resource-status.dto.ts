import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ResourceStatusType } from '../enum';

export class UpdateResourceStatusDto {
  @ApiProperty({ enum: ResourceStatusType, example: ResourceStatusType.DISPONIBLE })
  @IsEnum(ResourceStatusType)
  @IsNotEmpty()
  status: ResourceStatusType;
}
