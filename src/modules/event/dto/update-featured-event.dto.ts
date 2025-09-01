import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFeaturedEventDto } from './';
import { IsOptional } from 'class-validator';

export class UpdateFeaturedEventDto extends PartialType(CreateFeaturedEventDto) {
  @ApiProperty({ type: 'string', format: 'binary', required: false, isArray: true })
  @IsOptional()
  images?: any;
}
