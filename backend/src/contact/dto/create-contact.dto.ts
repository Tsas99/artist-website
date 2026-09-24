import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateContactDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @MaxLength(254)
    email!: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    subject?: string;

    @IsString()
    @MinLength(10)
    @MaxLength(5000)
    message!: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    website?: string;
}