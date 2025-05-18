import { PartialType } from '@nestjs/swagger';
import { CreateEventTaskDto } from './create-event-task.dto';

export class UpdateEventTaskDto extends PartialType(CreateEventTaskDto) {}