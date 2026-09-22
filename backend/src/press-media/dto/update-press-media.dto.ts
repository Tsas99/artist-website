import { PartialType } from '@nestjs/mapped-types';
import { CreatePressMediaDto } from './create-press-media.dto';

export class UpdatePressMediaDto extends PartialType(
    CreatePressMediaDto,
) {}