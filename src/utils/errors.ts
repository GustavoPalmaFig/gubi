import { isAuthApiError } from '@supabase/supabase-js';
import { toast } from '@/components/ui/toast';
import i18n from '@/i18n';

export function getErrorMessage(error: unknown) {
  if (isAuthApiError(error)) {
    return i18n.t(`auth.error.${error.code}`, { defaultValue: error.message });
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t('error.unexpected', { defaultValue: 'Unexpected error' });
}

export function showErrorToast(error: unknown) {
  toast.add({
    type: 'error',
    title: i18n.t('common.error'),
    description: getErrorMessage(error)
  });
}
