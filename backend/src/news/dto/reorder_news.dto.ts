
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsPositive,
} from 'class-validator';

export class ReorderNewsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  ids!: number[];
}
