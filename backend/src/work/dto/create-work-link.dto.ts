
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateWorkLinkDto {
  @IsString()
  @MaxLength(200)
  label!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
