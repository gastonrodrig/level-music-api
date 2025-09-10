import { PartialType } from '@nestjs/swagger';
import { CreateAssignationDto } from './create-assignations.dto';

export class UpdateAssignationDto extends PartialType(CreateAssignationDto) {}