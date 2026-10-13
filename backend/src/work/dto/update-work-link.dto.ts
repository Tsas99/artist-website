
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkLinkDto } from './create-work-link.dto';

export class UpdateWorkLinkDto extends PartialType(
  CreateWorkLinkDto,
) {}
