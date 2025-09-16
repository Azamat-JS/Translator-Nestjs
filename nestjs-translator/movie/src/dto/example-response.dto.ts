import { ApiProperty } from '@nestjs/swagger';

export class ExampleResponse {
  @ApiProperty()
  name: string;
  @ApiProperty()
  rating: number;
}
