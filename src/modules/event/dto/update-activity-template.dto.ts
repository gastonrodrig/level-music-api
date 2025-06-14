import { PartialType } from '@nestjs/swagger';
import { CreateActivityTemplateDto } from './';

export class UpdateActivityTemplateDto extends PartialType(CreateActivityTemplateDto) {}