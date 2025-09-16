import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Translatable } from '@movie/db';

export class TranslatableDto implements Translatable {
  @ApiProperty({ description: "O'zbekcha (lotincha)" })
  @IsNotEmpty()
  @IsString()
  oz: string; //uz latin

  @ApiPropertyOptional({ description: "O'zbekcha (kirillcha)" })
  @IsOptional()
  @IsString()
  uz: string; //uz cyrillic

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ru: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  en: string;
}
