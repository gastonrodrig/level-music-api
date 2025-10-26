import { PartialType } from "@nestjs/swagger";
import { CreateTaskEvidenceDto } from "./create-task-evidence.dto";


export class UpdateTaskEvidenceDto extends PartialType(CreateTaskEvidenceDto) {

}
