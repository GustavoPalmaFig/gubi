import { AppDivider } from '@/components/shared/AppDivider';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import googleLogoUrl from '@/assets/oauth-provider-logos/google-colored.svg';
import { useAuth } from '../hooks/useAuth';

export function ProvidersLogin() {
  const { loginWithOAuth } = useAuth();
  const { t } = useTranslation('translation', { keyPrefix: 'auth.login' });

  return (
    <>
      <AppDivider label={t('continue_with_provider')} labelPosition="center" />

      <Button variant="outline" size="xl" onClick={() => loginWithOAuth('google')}>
        <img src={googleLogoUrl} alt="Google" className="size-5" />
        <span className="text-muted-foreground">Google</span>
      </Button>
    </>
  );
}
