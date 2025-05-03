import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateEventServiceDto {
   
   @ApiProperty({ type: Types.ObjectId, example: '63f1b2c4e4b0d5a1c8f9e7a6', required: true })
   @IsString()
   @IsOptional()
   ServiceId: Types.ObjectId;

   @ApiProperty({ type: Types.ObjectId, example: '63f1b2c4e4b0d5a1c8f9e7a6', required: true })
   @IsString()
   @IsOptional()
   EventId: Types.ObjectId;
}
