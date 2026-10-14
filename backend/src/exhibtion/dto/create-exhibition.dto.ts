
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateExhibitionDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsOptional()
  @IsString()
  curatorialText?: string;

  // External Link
  @IsOptional()
  @IsString()
  linkTitle?: string;

 @IsOptional()
 @IsUrl({
  require_protocol: true,
  protocols: ['http', 'https'],
 })
 link?: string | null;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
