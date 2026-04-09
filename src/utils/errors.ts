import { isAuthApiError } from '@supabase/supabase-js';
import i18n from '@/i18n';
import { showNotification } from './showNotification';

export function getErrorMessage(error: unknown) {
  if (isAuthApiError(error)) {
    return i18n.t(`auth.error.${error.code}`, { defaultValue: error.message });
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t('error.unexpected', { defaultValue: 'Unexpected error' });
}

export function showErrorNotification(error: unknown) {
  showNotification({
    title: i18n.t('error.title'),
    message: getErrorMessage(error),
    type: 'negative'
  });
}
