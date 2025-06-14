import { PartialType } from '@nestjs/swagger';
import { CreateEventTypeDto } from './';

export class UpdateEventTypeDto extends PartialType(CreateEventTypeDto) {}
