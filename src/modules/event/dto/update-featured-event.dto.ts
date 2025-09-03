import { PartialType } from '@nestjs/swagger';
import { CreateFeaturedEventDto } from './';

export class UpdateFeaturedEventDto extends PartialType(CreateFeaturedEventDto) {}
