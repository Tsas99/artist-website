import { PartialType } from "@nestjs/mapped-types";
import { CreatePressDto } from "./create-press.dto";

export class UpdatePressDto extends PartialType(
    CreatePressDto,
) {}