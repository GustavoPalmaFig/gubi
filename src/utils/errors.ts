import { isAuthApiError } from '@supabase/supabase-js';
import i18n from '@/i18n';
import { showNotification } from './showNotification';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export function getErrorMessage(error: unknown) {
  if (isAuthApiError(error)) {
    return i18n.t(`auth.error.${error.code}`, { defaultValue: error.message });
  }

  if (error instanceof Error || isErrorWithMessage(error)) {
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
