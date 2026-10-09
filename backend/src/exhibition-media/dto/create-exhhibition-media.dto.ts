import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExhibitionMediaDto {
  @IsUrl()
  url!: string;

  @IsString()
  @MinLength(1)
  publicId!: string;

  @IsIn(['image', 'video'])
  type!: 'image' | 'video';

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsInt()
  @Min(1)
  exhibitionId!: number;
}