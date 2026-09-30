import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkMediaInput {
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
}

export class CreateWorkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediums?: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;  

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  eventName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  theme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  place?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  dimensions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  year?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkMediaInput)
  media?: CreateWorkMediaInput[];
}