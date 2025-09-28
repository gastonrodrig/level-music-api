import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEventDto, ClientInfoDto } from '.';

export class CreateQuotationLandingDto extends IntersectionType(CreateEventDto) {
  @ApiProperty({ type: ClientInfoDto })
  @ValidateNested()
  @Type(() => ClientInfoDto)
  client_info: ClientInfoDto;
}
