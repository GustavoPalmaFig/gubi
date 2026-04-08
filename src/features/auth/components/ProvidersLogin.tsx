import { Button, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import googleLogoUrl from '@/assets/oauth-provider-logos/google-colored.svg';
import { useAuth } from '../hooks/useAuth';

export function ProvidersLogin() {
  const { loginWithOAuth } = useAuth();
  const { t } = useTranslation('translation', { keyPrefix: 'auth.login' });

  return (
    <>
      <Divider label={t('continue_with_provider')} labelPosition="center" />

      <Button
        variant="default"
        leftSection={<img src={googleLogoUrl} alt="Google" className="size-5" />}
        onClick={() => loginWithOAuth('google')}
      >
        <span className="text-muted-foreground">Google</span>
      </Button>
    </>
  );
}
