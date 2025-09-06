import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import express from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/hello')
  async getI18nHello(@I18n() i18n: I18nContext) {
    return i18n.t('test.SALOM');
  }

  @Get('/cookie')
  async setCookie( @Res() res: express.Response){
   res.cookie('lang', 'nl', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 6000000
    });
    return res.json({ message: 'success' }); 
  }

  @Get('/test')
  async getTest(@I18n() i18test: I18nContext){
    return this.appService.getTest(i18test)
  }

  @Get('/param/:lang')
  async getParam(
    @Param('lang') lang: string,
    @I18n() i18nContext: I18nContext
  ) {
    return this.appService.getParam(lang, i18nContext);
  }
}
