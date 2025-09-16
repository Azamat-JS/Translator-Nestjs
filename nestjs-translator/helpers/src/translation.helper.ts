// translation.helper.ts
import { I18nService } from 'nestjs-i18n';
import { TranslationKeys } from './translation';

// global o'zgaruvchi
let i18nService:  I18nService<Record<string, unknown>>;

export function setI18n(service: I18nService) {
  i18nService = service;
}

// ✅ Sync version (main one to use in most cases)
export function __(key: TranslationKeys, args?: Record<string, string>): string {
  return i18nService ? i18nService.translate(key, { args }) : key;
}

// Optional: Async version if needed elsewhere
export async function __a(key: TranslationKeys, args?: Record<string, string>): Promise<string> {
  return i18nService ? await i18nService.translate(key, { args }) : key;
}

