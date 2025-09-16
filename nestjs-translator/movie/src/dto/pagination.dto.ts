import { IsInt, IsOptional, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ name: 'per_page', example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Expose({ name: 'per_page' })
  perPage: number = 20;

  getPage(): number {
    return this.page ?? 1;
  }

  getPerPage(): number {
    return this.perPage ?? 20;
  }
}
