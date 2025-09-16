import { Request } from 'express';
import { appLanguages, User } from '@movie/db/enums/base.enum';

export type RequestWithUser = Request & {
  user: User;
  lang: appLanguages;
};
