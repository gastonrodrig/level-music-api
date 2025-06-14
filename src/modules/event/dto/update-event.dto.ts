import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
