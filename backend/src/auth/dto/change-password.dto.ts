
import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  newPassword!: string;

  @IsString()
  confirmPassword!: string;
}
