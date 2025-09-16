import { Injectable } from '@nestjs/common';
import { DataSource, InjectDb } from '@movie/db';

@Injectable()
export class PromoCodeService {
  constructor(@InjectDb() private readonly db: DataSource) {}
}
