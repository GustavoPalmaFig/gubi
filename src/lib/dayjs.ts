import 'dayjs/locale/en';
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';
import i18n from '@/i18n';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { SystemLocale } from '@/features/types/systemLocale';

dayjs.extend(relativeTime);

function syncDayjsLocale(locale: SystemLocale) {
  dayjs.locale(locale.toLowerCase());
}

syncDayjsLocale(i18n.language as SystemLocale);

i18n.on('languageChanged', locale => {
  syncDayjsLocale(locale as SystemLocale);
});

export { dayjs };
