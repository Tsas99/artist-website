import { PartialType } from '@nestjs/mapped-types';
import { CreateCvEntryDto } from './create-cv-entry.dto';

export class UpdateCvEntryDto extends PartialType(
  CreateCvEntryDto,
) {}