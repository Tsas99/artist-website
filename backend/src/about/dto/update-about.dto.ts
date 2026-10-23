
import {
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  artistStatement?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  profileImageUrl?: string | null;

  @IsOptional()
  @IsString()
  profileImagePublicId?: string | null;
}
