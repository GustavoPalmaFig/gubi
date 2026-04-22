import { Button, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconLock, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { showErrorNotification } from '@/utils/errors';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProvidersLogin } from '../components/ProvidersLogin';
import { useAuth } from '../hooks/useAuth';

const loginFormSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(8)
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { simpleLogin } = useAuth();
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange'
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await simpleLogin(data.email, data.password);
    } catch (error: unknown) {
      showErrorNotification(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="h-full">
      <Stack className="h-full justify-center gap-7">
        <Stack className="gap-2">
          <Title order={1}>{t('login.title')}</Title>
          <Text className="text-muted-foreground text-sm">{t('login.description')}</Text>
        </Stack>

        <Stack className="gap-5">
          <TextInput
            label={t('login.email')}
            placeholder={t('login.email_placeholder')}
            leftSection={<IconMail size={18} />}
            {...register('email')}
            classNames={{
              input: 'bg-white'
            }}
          />

          <PasswordInput
            label={t('login.password')}
            placeholder={t('login.password_placeholder')}
            leftSection={<IconLock size={18} />}
            {...register('password')}
            classNames={{
              input: 'bg-white'
            }}
          />
        </Stack>

        <Button
          type="submit"
          disabled={!isValid}
          loading={isSubmitting}
          loaderProps={{ type: 'dots' }}
        >
          {t('login.submit')}
        </Button>

        <ProvidersLogin />

        <Text className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth.login.no_account"
            components={[<Link to="/register" className="text-primary font-semibold" />]}
          />
        </Text>
      </Stack>
    </form>
  );
}
