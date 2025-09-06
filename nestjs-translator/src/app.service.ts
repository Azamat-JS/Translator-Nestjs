import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}
  getHello(): string {
    return this.i18n.t('test.mushuk', { lang: I18nContext.current()?.lang || 'nl' });
  }

  getTest(i18test: I18nContext):string {
    return i18test.t('test.cat_name', {args: {name: "Murzik"}})
  }

  getParam(lang: string, i18nContext: I18nContext):string {
    return i18nContext.t('test.CURRENT_LANGUAGE', { lang, args:{lang: 'uzbek'} });
  }
}
