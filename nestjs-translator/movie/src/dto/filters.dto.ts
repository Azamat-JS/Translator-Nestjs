import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FiltersDto extends PaginationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;
}
