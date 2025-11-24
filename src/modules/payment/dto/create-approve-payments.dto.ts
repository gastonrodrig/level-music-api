import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAllPaymentsDto {
  @ApiProperty({
    description: 'ID del evento',
    example: '68fa352e038345fc4290f084',
  })
  @IsNotEmpty()
  @IsString()
  event_id: string;
}