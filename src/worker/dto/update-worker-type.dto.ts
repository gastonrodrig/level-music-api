import { PartialType } from '@nestjs/swagger';
import { CreateWorkerTypeDto } from './create-worker-type.dto';

export class UpdateWorkerTypeDto extends PartialType(CreateWorkerTypeDto) {}