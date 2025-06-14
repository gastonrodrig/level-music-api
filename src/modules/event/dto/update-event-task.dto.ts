import { PartialType } from '@nestjs/swagger';
import { CreateEventTaskDto } from './';

export class UpdateEventTaskDto extends PartialType(CreateEventTaskDto) {}