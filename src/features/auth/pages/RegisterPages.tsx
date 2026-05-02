import { Button, PasswordInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { currencyOptions, currencyOptionSelect } from '@/constants/currencyOptions';
import { IconCoins, IconLanguage, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { localeOptions, localeOptionsSelect } from '@/constants/localeOptions';
import { showErrorNotification } from '@/utils/errors';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SystemLocale } from '@/types/systemLocale';
import { ProvidersLogin } from '../components/ProvidersLogin';
import { useAuth } from '../hooks/useAuth';

const registerFormSchema = z
  .object({
    full_name: z.string().trim().min(3),
    email: z.email().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    locale: z.enum(localeOptions),
    currency: z.enum(currencyOptions)
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword']
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'auth' });

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onChange',
    defaultValues: {
      locale: i18n.language as SystemLocale,
      currency: 'BRL' //TODO: change to user's location
    }
  });

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(
        {
          full_name: data.full_name,
          email: data.email,
          locale: data.locale,
          currency: data.currency
        },
        data.password
      );
    } catch (error: unknown) {
      showErrorNotification(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="h-full">
      <Stack className="h-full justify-center gap-7">
        <Stack className="gap-2">
          <Title order={1}>{t('register.title')}</Title>
          <Text className="text-muted-foreground text-sm">{t('register.description')}</Text>
        </Stack>

        <Stack className="gap-5">
          <TextInput
            label={t('register.full_name')}
            placeholder={t('register.full_name_placeholder')}
            leftSection={<IconUser size={18} />}
            {...register('full_name')}
            classNames={{
              input: 'bg-white'
            }}
          />

          <TextInput
            label={t('register.email')}
            placeholder={t('register.email_placeholder')}
            leftSection={<IconMail size={18} />}
            {...register('email')}
            classNames={{
              input: 'bg-white'
            }}
          />

          <Controller
            name="locale"
            control={control}
            render={({ field }) => (
              <Select
                label={t('register.locale')}
                leftSection={<IconLanguage size={18} />}
                data={[...localeOptionsSelect]}
                value={field.value}
                onChange={v => field.onChange(v ?? field.value)}
                classNames={{
                  input: 'bg-white'
                }}
              />
            )}
          />

          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                label={t('register.currency')}
                leftSection={<IconCoins size={18} />}
                data={[...currencyOptionSelect]}
                value={field.value}
                onChange={v => field.onChange(v ?? field.value)}
                classNames={{
                  input: 'bg-white'
                }}
              />
            )}
          />

          <PasswordInput
            label={t('register.password')}
            placeholder={t('register.password_placeholder')}
            leftSection={<IconLock size={18} />}
            {...register('password')}
            classNames={{
              input: 'bg-white'
            }}
          />

          <PasswordInput
            label={t('register.confirm_password')}
            placeholder={t('register.confirm_password_placeholder')}
            leftSection={<IconLock size={18} />}
            {...register('confirmPassword')}
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
          {t('register.submit')}
        </Button>

        <ProvidersLogin />

        <Text className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth.register.already_have_account"
            components={[<Link to="/login" className="text-primary font-semibold" />]}
          />
        </Text>
      </Stack>
    </form>
  );
}
