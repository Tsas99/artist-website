
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export type CreatePressMediaInput = {
  url: string;
  publicId: string;
  sortOrder?: number;
};

class PressMediaDto {
  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreatePressDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  linkTitle?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  coverPublicId?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PressMediaDto)
  media?: PressMediaDto[];
}
