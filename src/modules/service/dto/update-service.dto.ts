import { PartialType } from "@nestjs/swagger";
import { CreateServiceDto } from "./create-service.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
    @IsOptional()
    @IsString()
    status?: string;

    

}