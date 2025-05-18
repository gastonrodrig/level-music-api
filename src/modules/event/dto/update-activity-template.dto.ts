import { PartialType } from '@nestjs/swagger';
import { CreateActivityTemplateDto } from './create-activity-template.dto';

export class UpdateActivityTemplateDto extends PartialType(CreateActivityTemplateDto) {}