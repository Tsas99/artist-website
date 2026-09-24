import {
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateHomeMediaDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}