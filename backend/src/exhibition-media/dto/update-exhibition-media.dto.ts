import { PartialType } from '@nestjs/mapped-types';
import { CreateExhibitionMediaDto } from './create-exhhibition-media.dto';


export class UpdateExhibitionMediaDto extends PartialType(
  CreateExhibitionMediaDto,
) {}