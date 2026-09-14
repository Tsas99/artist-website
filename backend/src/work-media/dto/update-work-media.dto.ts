import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkMediaDto } from './create-work-media.dto';

export class UpdateWorkMediaDto extends PartialType(CreateWorkMediaDto) {}
