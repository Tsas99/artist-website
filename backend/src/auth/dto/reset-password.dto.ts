
import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  newPassword!: string;

  @IsString()
  confirmPassword!: string;
}
