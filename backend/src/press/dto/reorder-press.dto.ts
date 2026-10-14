
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
} from 'class-validator';

export class ReorderPressDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids!: number[];
}
