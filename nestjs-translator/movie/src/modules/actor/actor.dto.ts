import { Expose, Type } from 'class-transformer';
import { genderType } from '@movie/db/enums/base.enum';
import { Translatable } from '@movie/db';

export class ActorResponseDto {
  id: string;
  name: Translatable;
  biography?: string | null;
  @Type(() => String)
  gender: genderType;
  @Expose({ name: 'birth_date', toPlainOnly: true })
  birthDate: Date | null;
  @Expose({ name: 'death_date', toPlainOnly: true })
  deathDate: Date | null;
  slug: string;
  @Expose({ name: 'image_url', toPlainOnly: true })
  imageUrl?: string | null;
  roles: Array<{ role: string; role_id: string }>;
}
