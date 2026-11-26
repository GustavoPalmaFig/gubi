import {
  CURRENCY_OPTIONS,
  CURRENCY_OPTIONS_SELECT,
  LOCALE_CURRENCY_MAP
} from '@/constants/currencyOptions';
import { AppPasswordInput } from '@/components/shared/input/AppPasswordInput';
import { AppSelect } from '@/components/shared/select/AppSelect';
import { AppTextInput } from '@/components/shared/input/AppTextInput';
import { Button } from '@/components/ui/button';
import { CoinsIcon, GlobeIcon, MailIcon, UserIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { LOCALE_OPTIONS, LOCALE_OPTIONS_SELECT } from '@/constants/localeOptions';
import { showErrorToast } from '@/utils/errors';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SystemLocale } from '@/features/types/systemLocale';
import { ProvidersLogin } from '../components/ProvidersLogin';
import { useAuth } from '../hooks/useAuth';

const registerFormSchema = z
  .object({
    full_name: z.string().trim().min(3),
    email: z.email().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    locale: z.enum(LOCALE_OPTIONS),
    currency: z.enum(CURRENCY_OPTIONS)
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
      currency: LOCALE_CURRENCY_MAP[i18n.language as SystemLocale]
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
      showErrorToast(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="h-full">
      <div className="flex h-full flex-col justify-center gap-7">
        <div>
          <p className="text-2xl font-bold">{t('register.title')}</p>
          <span className="text-muted-foreground text-sm">
            {t('register.description')}
          </span>
        </div>

        <div className="space-y-5">
          <AppTextInput
            id="registerFullName"
            type="text"
            label={t('register.full_name')}
            placeholder={t('register.full_name_placeholder')}
            leftSection={<UserIcon size={18} />}
            {...register('full_name')}
          />

          <AppTextInput
            id="registerEmail"
            type="email"
            label={t('register.email')}
            placeholder={t('register.email_placeholder')}
            leftSection={<MailIcon size={18} />}
            {...register('email')}
          />

          <AppPasswordInput
            id="registerPassword"
            label={t('register.password')}
            placeholder={t('register.password_placeholder')}
            {...register('password')}
          />

          <AppPasswordInput
            id="registerConfirmPassword"
            label={t('register.confirm_password')}
            placeholder={t('register.confirm_password_placeholder')}
            {...register('confirmPassword')}
          />

          <Controller
            name="locale"
            control={control}
            render={({ field }) => (
              <AppSelect
                label={t('register.locale')}
                leftSection={<GlobeIcon size={18} />}
                options={[...LOCALE_OPTIONS_SELECT]}
                value={field.value}
                onValueChange={v => field.onChange(v ?? field.value)}
              />
            )}
          />

          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <AppSelect
                label={t('register.currency')}
                leftSection={<CoinsIcon size={18} />}
                options={[...CURRENCY_OPTIONS_SELECT]}
                value={field.value}
                onValueChange={v => field.onChange(v ?? field.value)}
              />
            )}
          />
        </div>

        <Button
          type="submit"
          size="xl"
          disabled={!isValid}
          loading={isSubmitting}
          loaderType="dots"
        >
          {!isSubmitting && t('login.submit')}
        </Button>

        <ProvidersLogin />

        <span className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth.register.already_have_account"
            components={[<Link to="/login" className="text-primary font-semibold" />]}
          />
        </span>
      </div>
    </form>
  );
}
