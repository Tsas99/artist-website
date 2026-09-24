import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateHomeMediaDto {
  @IsString()
  @IsUrl()
  url!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}