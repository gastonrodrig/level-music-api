import { PartialType } from '@nestjs/swagger';
import { CreateFirebaseUserDto } from './create-firebase-user.dto';

export class UpdateFirebaseUserDto extends PartialType(CreateFirebaseUserDto) {}
