import { AppTextInput } from '@/components/shared/input/AppTextInput';
import { AuthApiError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });

  const { simpleLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

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
      if (error instanceof AuthApiError) {
        console.error(t(`error.${error.code}`));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="h-full">
      <div className="flex h-full flex-col justify-center gap-7">
        <div className="gap-2">
          <p className="text-2xl font-bold">{t('login.title')}</p>
          <span className="text-muted-foreground text-sm">{t('login.description')}</span>
        </div>

        <div className="space-y-5">
          <AppTextInput
            id="loginEmail"
            type="email"
            label={t('login.email')}
            placeholder={t('login.email_placeholder')}
            leftSection={<MailIcon size={18} />}
            {...register('email')}
          />

          <AppTextInput
            id="loginPassword"
            type={showPassword ? 'text' : 'password'}
            label={t('login.password')}
            placeholder={t('login.password_placeholder')}
            leftSection={<LockIcon size={18} />}
            rightSection={
              showPassword ? (
                <EyeOffIcon
                  size={18}
                  onClick={() => setShowPassword(false)}
                  className="cursor-pointer"
                />
              ) : (
                <EyeIcon
                  size={18}
                  onClick={() => setShowPassword(true)}
                  className="cursor-pointer"
                />
              )
            }
            {...register('password')}
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
            i18nKey="auth.login.no_account"
            components={[<Link to="/register" className="text-primary font-semibold" />]}
          />
        </span>
      </div>
    </form>
  );
}
