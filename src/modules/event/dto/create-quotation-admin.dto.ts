import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEventDto, ClientInfoDto } from '.';
import { ResourceType } from '../enum';

class AssignationRequestDto {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  resource_type: ResourceType;

  @ApiProperty()
  @IsMongoId()
  resource_id: string;

  @ApiProperty()
  @IsNumber()
  hours: number;

  @ApiProperty()
  @IsNumber()
  hourly_rate: number;

  @ApiProperty()
  @IsDateString()
  available_from: Date;

  @ApiProperty()
  @IsDateString()
  available_to: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  payment_percentage_required?: number;
}

export class CreateQuotationAdminDto extends IntersectionType(CreateEventDto) {
  @ApiProperty({ type: [AssignationRequestDto] })
  @ValidateNested({ each: true })
  @Type(() => AssignationRequestDto)
  assignations: AssignationRequestDto[];

  @ApiProperty({ type: ClientInfoDto })
  @ValidateNested()
  @Type(() => ClientInfoDto)
  client_info: ClientInfoDto;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  estimated_price: number;
}
